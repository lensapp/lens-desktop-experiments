import { useSyncInject } from "@lensapp/use-sync-inject";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clusterDescriptorsInjectable } from "./monorepo-adapters/cluster-descriptors.injectable";
import { failureMessage, shareLinkFailureMessage } from "./navigation/failure-messages";
import { navigateFromLocationInputInjectionToken } from "./navigation/navigate-from-location-input.injectable";
import { navigateFromShareLinkInjectionToken } from "./navigation/navigate-from-share-link.injectable";
import { parseLocationBarInput } from "./_shared/parse-location-bar-input";
import { isShareLink, parseShareLink } from "./_shared/parse-share-link";
import { connectionTypeForSlug } from "./_shared/source-slug";
import sendLocationBarTelemetryInjectable from "./telemetry/send-location-bar-telemetry.injectable";

const allNamespacesSelectedValue = "*";

const navigationTargetShape = (
  namespaces: readonly string[] | undefined,
  resourcePluralName: string | undefined,
  resourceName: string | undefined,
) => ({
  hasResourceType: resourcePluralName !== undefined,
  namespaceCount: namespaces?.length ?? 0,
  isAllNamespaces: namespaces?.some((name) => name === allNamespacesSelectedValue) ?? false,
  hasResourceName: resourceName !== undefined,
});

export type EditableLocationBarModel = {
  readonly isEditing: boolean;
  readonly errorMessage: string | undefined;
  readonly beginEdit: () => void;
  readonly cancelEdit: () => void;
  readonly finishEdit: () => void;
  readonly submitEdit: (value: string) => Promise<boolean>;
};

export const useEditableLocationBarModel = (): EditableLocationBarModel => {
  const navigate = useSyncInject(navigateFromLocationInputInjectionToken);
  const navigateFromShareLink = useSyncInject(navigateFromShareLinkInjectionToken);
  const sendTelemetry = useSyncInject(sendLocationBarTelemetryInjectable);
  const clusterDescriptors = useSyncInject(clusterDescriptorsInjectable).get();
  const clusterLookupNames = useMemo(() => {
    const seen = new Set<string>();
    const names: string[] = [];

    for (const descriptor of clusterDescriptors) {
      for (const candidate of [descriptor.displayName, descriptor.name]) {
        if (!seen.has(candidate)) {
          seen.add(candidate);
          names.push(candidate);
        }
      }
    }

    return names;
  }, [clusterDescriptors]);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const beginEdit = useCallback(() => {
    setErrorMessage(undefined);
    setIsEditing(true);
    sendTelemetry({ action: "edit-opened", params: { trigger: "click" } });
  }, [sendTelemetry]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;

      if (isModifier && event.key.toLowerCase() === "l") {
        event.preventDefault();
        setErrorMessage(undefined);
        setIsEditing(true);
        sendTelemetry({ action: "edit-opened", params: { trigger: "shortcut" } });
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, [sendTelemetry]);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrorMessage(undefined);
  }, []);

  const finishEdit = useCallback(() => {
    setIsEditing(false);
    setErrorMessage(undefined);
  }, []);

  const submitEdit = useCallback(
    async (value: string): Promise<boolean> => {
      if (isShareLink(value)) {
        const parsed = parseShareLink(value);

        if (!parsed) {
          setErrorMessage("Malformed share link");
          sendTelemetry({
            action: "navigation-failed",
            params: { source: "share-link", kind: "malformed" },
          });
          return false;
        }

        const failure = await navigateFromShareLink(parsed);

        if (failure) {
          setErrorMessage(shareLinkFailureMessage(failure));
          sendTelemetry({
            action: "navigation-failed",
            params: { source: "share-link", kind: failure.kind },
          });
          return false;
        }

        setErrorMessage(undefined);
        sendTelemetry({
          action: "navigated-from-share-link",
          params: {
            connectionType: connectionTypeForSlug(parsed.sourceSlug),
            ...navigationTargetShape(parsed.namespaces, parsed.resourcePluralName, parsed.resourceName),
          },
        });
        return true;
      }

      const parsed = parseLocationBarInput(value, clusterLookupNames);

      if (!parsed) {
        setErrorMessage("Enter a path like cluster/pods/namespace");
        sendTelemetry({
          action: "navigation-failed",
          params: { source: "input", kind: "unparseable" },
        });
        return false;
      }

      const failure = await navigate(parsed);

      if (failure) {
        setErrorMessage(failureMessage(failure));
        sendTelemetry({
          action: "navigation-failed",
          params: { source: "input", kind: failure.kind },
        });
        return false;
      }

      setErrorMessage(undefined);
      sendTelemetry({
        action: "navigated-from-input",
        params: navigationTargetShape(parsed.namespaces, parsed.resourcePluralName, parsed.resourceName),
      });
      return true;
    },
    [navigate, navigateFromShareLink, clusterLookupNames, sendTelemetry],
  );

  return { isEditing, errorMessage, beginEdit, cancelEdit, finishEdit, submitEdit };
};

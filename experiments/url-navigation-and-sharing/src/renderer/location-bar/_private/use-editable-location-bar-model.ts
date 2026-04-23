import { useSyncInject } from "@lensapp/use-sync-inject";
import { useCallback, useEffect, useMemo, useState } from "react";
import { clusterDescriptorsInjectable } from "./monorepo-adapters/cluster-descriptors.injectable";
import { failureMessage, shareLinkFailureMessage } from "./navigation/failure-messages";
import { navigateFromLocationInputInjectionToken } from "./navigation/navigate-from-location-input.injectable";
import { navigateFromShareLinkInjectionToken } from "./navigation/navigate-from-share-link.injectable";
import { parseLocationBarInput } from "./_shared/parse-location-bar-input";
import { isShareLink, parseShareLink } from "./_shared/parse-share-link";

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
  }, []);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const isModifier = event.ctrlKey || event.metaKey;

      if (isModifier && event.key.toLowerCase() === "l") {
        event.preventDefault();
        setErrorMessage(undefined);
        setIsEditing(true);
      }
    };

    window.addEventListener("keydown", handler);

    return () => window.removeEventListener("keydown", handler);
  }, []);

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
          return false;
        }

        const failure = await navigateFromShareLink(parsed);

        if (failure) {
          setErrorMessage(shareLinkFailureMessage(failure));
          return false;
        }

        setErrorMessage(undefined);
        return true;
      }

      const parsed = parseLocationBarInput(value, clusterLookupNames);

      if (!parsed) {
        setErrorMessage("Enter a path like cluster/pods/namespace");
        return false;
      }

      const failure = await navigate(parsed);

      if (failure) {
        setErrorMessage(failureMessage(failure));
        return false;
      }

      setErrorMessage(undefined);
      return true;
    },
    [navigate, navigateFromShareLink, clusterLookupNames],
  );

  return { isEditing, errorMessage, beginEdit, cancelEdit, finishEdit, submitEdit };
};

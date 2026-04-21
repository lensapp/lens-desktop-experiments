import { getInjectable } from "@lensapp/injectable";
import { leftItemInjectionToken } from "@lensapp/top-bar";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { useInjectAsReactive } from "@lensapp/use-inject-as-reactive";
import {
  activeClusterEntityForSelectedTabInjectionToken,
  selectedClusterTabInjectionToken,
} from "@lensapp/kubernetes-resources";
import { selectedTabReactiveInjectionToken } from "@lensapp/main-view";
import { selectedNamespacesForFilteringInjectionToken } from "@lensapp/selecting-namespaces";
import { currentKubeObjectInDetailsOrUndefinedInjectionToken } from "@lensapp/kube-object-details-panel";
import { clusterDisplayNameInjectionToken } from "@lensapp/cluster-common";
import { getCustomProtocolUrl } from "@lensapp/share-common";
import { Button, ClickableDiv, Div, Form, Input, Span } from "@lensapp/element-components";
import { observer } from "mobx-react";
import React, { useCallback, useState } from "react";
import { synthesizeClusterBreadcrumb } from "./synthesize-breadcrumb";
import { labelForTabType } from "./label-for-tab-type";
import { parseLocationBarInput } from "./parse-location-bar-input";
import { formatShareLink, isShareLink, parseShareLink } from "./parse-share-link";
import {
  type NavigationFailure,
  navigateFromLocationInputInjectionToken,
} from "./navigate-from-location-input.injectable";
import { navigateFromShareLinkInjectionToken } from "./navigate-from-share-link.injectable";
import { resolveClusterShareInfoInjectionToken } from "./cluster-share-info.injectable";
import { openShareMenuInjectionToken } from "./open-share-menu.injectable";

const locationBarOrderNumber = 100;
const segmentSeparator = "/";
const defaultNonClusterLabel = "Lens";
const kubeDetailsUrlParamName = "kube-details";
const allNamespacesSelectedValue = "*";

const failureMessage = (failure: NavigationFailure): string => {
  switch (failure.kind) {
    case "cluster-not-found":
      return `Cluster "${failure.clusterName}" not found`;
    case "resource-type-not-found":
      return `Resource type "${failure.resourcePluralName}" not found`;
  }
};

const pluralNameFromResourcePath = (path: string | undefined): string | undefined => {
  if (!path) {
    return undefined;
  }

  const segments = path.split("/").filter(Boolean);

  return segments[segments.length - 1];
};

const singleNamespaceOrUndefined = (namespaces: readonly string[] | undefined): string | undefined => {
  if (!namespaces || namespaces.length !== 1) {
    return undefined;
  }

  const [only] = namespaces;

  return only === allNamespacesSelectedValue ? undefined : only;
};

type LocationBarViewProps = {
  readonly segments: readonly string[];
  readonly onEditRequested?: () => void;
};

const LocationBarView = ({ segments, onEditRequested }: LocationBarViewProps) => {
  const content = (
    <>
      {segments.map((segment, index) => (
        <React.Fragment key={`${index}:${segment}`}>
          {index > 0 && (
            <Span aria-hidden $style={{ opacity: 0.5 }}>
              {segmentSeparator}
            </Span>
          )}
          <Span $font={{ noWrap: true, textOverflow: "ellipsis" }} $overflow="hidden">
            {segment}
          </Span>
        </React.Fragment>
      ))}
    </>
  );

  if (!onEditRequested) {
    return (
      <Div
        data-location-bar-test
        $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
        $padding={{ horizontal: "s" }}
        $overflow="hidden"
        $style={{ fontFamily: "monospace", minWidth: 0 }}
      >
        {content}
      </Div>
    );
  }

  return (
    <ClickableDiv
      data-location-bar-test
      onClick={onEditRequested}
      aria-label="Edit location"
      $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
      $padding={{ horizontal: "s" }}
      $overflow="hidden"
      $style={{ fontFamily: "monospace", minWidth: 0, cursor: "text" }}
    >
      {content}
    </ClickableDiv>
  );
};

type LocationBarInputProps = {
  readonly initialValue: string;
  readonly errorMessage: string | undefined;
  readonly onSubmit: (value: string) => void;
  readonly onCancel: () => void;
};

const LocationBarInput = ({ initialValue, errorMessage, onSubmit, onCancel }: LocationBarInputProps) => {
  const [value, setValue] = useState(initialValue);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCancel();
      }
    },
    [onCancel],
  );

  const handleBlur = useCallback(
    (event: React.FocusEvent<HTMLFormElement>) => {
      const nextFocus = event.relatedTarget as Node | null;

      if (nextFocus && event.currentTarget.contains(nextFocus)) {
        return;
      }

      onCancel();
    },
    [onCancel],
  );

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit(value);
    },
    [onSubmit, value],
  );

  // Pasted share links submit immediately: the user isn't authoring a path,
  // they're handing off a portable identifier and expect instant navigation.
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData("text");

      if (isShareLink(pasted)) {
        event.preventDefault();
        setValue(pasted);
        onSubmit(pasted);
      }
    },
    [onSubmit],
  );

  return (
    <Form
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
      $padding={{ horizontal: "s" }}
      $style={{ fontFamily: "monospace", width: "min(40rem, 60vw)" }}
    >
      <Input
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        aria-label="Location input"
        aria-invalid={errorMessage !== undefined}
        $style={{
          fontFamily: "monospace",
          flex: 1,
          minWidth: 0,
          border: "none",
          outline: "none",
          background: "transparent",
          color: "inherit",
        }}
      />
      {errorMessage && (
        <Span role="alert" $style={{ color: "var(--colorError)", whiteSpace: "nowrap" }}>
          {errorMessage}
        </Span>
      )}
    </Form>
  );
};

type EditableLocationBarProps = {
  readonly segments: readonly string[];
};

const EditableLocationBar = ({ segments }: EditableLocationBarProps) => {
  const navigate = useSyncInject(navigateFromLocationInputInjectionToken);
  const navigateFromShareLink = useSyncInject(navigateFromShareLinkInjectionToken);
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);

  const enterEditMode = useCallback(() => {
    setErrorMessage(undefined);
    setIsEditing(true);
  }, []);

  const cancelEdit = useCallback(() => {
    setIsEditing(false);
    setErrorMessage(undefined);
  }, []);

  const submitEdit = useCallback(
    async (value: string) => {
      if (isShareLink(value)) {
        const parsed = parseShareLink(value);

        if (!parsed) {
          setErrorMessage("Malformed share link");
          return;
        }

        await navigateFromShareLink(parsed);
        setIsEditing(false);
        setErrorMessage(undefined);
        return;
      }

      const parsed = parseLocationBarInput(value);

      if (!parsed) {
        setErrorMessage("Enter a path like cluster/namespace/pods");
        return;
      }

      const failure = await navigate(parsed);

      if (failure) {
        setErrorMessage(failureMessage(failure));
        return;
      }

      setIsEditing(false);
      setErrorMessage(undefined);
    },
    [navigate, navigateFromShareLink],
  );

  if (isEditing) {
    return (
      <LocationBarInput
        initialValue={segments.join(segmentSeparator)}
        errorMessage={errorMessage}
        onSubmit={submitEdit}
        onCancel={cancelEdit}
      />
    );
  }

  return <LocationBarView segments={segments} onEditRequested={enterEditMode} />;
};

type ClusterToolbarActionsProps = {
  readonly clusterId: string;
  readonly resourcePluralName: string | undefined;
  readonly namespace: string | undefined;
  readonly resourceName: string | undefined;
  readonly resourceSelfLink: string | undefined;
};

const ClusterToolbarActions = ({
  clusterId,
  resourcePluralName,
  namespace,
  resourceName,
  resourceSelfLink,
}: ClusterToolbarActionsProps) => {
  const resolveClusterShareInfo = useSyncInject(resolveClusterShareInfoInjectionToken);
  const openShareMenu = useSyncInject(openShareMenuInjectionToken);
  const [status, setStatus] = useState<"idle" | "copied" | "error">("idle");

  const handleCopy = useCallback(async () => {
    const info = await resolveClusterShareInfo(clusterId);

    if (!info) {
      setStatus("error");
      return;
    }

    const text = formatShareLink({
      sourceSlug: info.sourceSlug,
      clusterSpecifier: info.clusterSpecifier,
      namespace,
      resourcePluralName,
      resourceName,
    });

    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      // Revert to idle after a beat so the user can invoke it again.
      setTimeout(() => setStatus("idle"), 1500);
    } catch {
      setStatus("error");
    }
  }, [resolveClusterShareInfo, clusterId, namespace, resourcePluralName, resourceName]);

  const handleShare = useCallback(async () => {
    const info = await resolveClusterShareInfo(clusterId);

    if (!info) {
      setStatus("error");
      return;
    }

    const tail = resourcePluralName ? `/${resourcePluralName}` : "";
    const query: Record<string, string> = {};

    if (resourceSelfLink) {
      query[kubeDetailsUrlParamName] = resourceSelfLink;
    }

    const url = getCustomProtocolUrl({
      connectionType: info.connectionType,
      clusterSpecifier: info.clusterSpecifier,
      frame: "cluster",
      query,
      tail,
    });

    openShareMenu(url);
  }, [resolveClusterShareInfo, clusterId, resourcePluralName, resourceSelfLink, openShareMenu]);

  const copyLabel = status === "copied" ? "Copied" : status === "error" ? "Error" : "Copy";

  return (
    <Div $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }} $padding={{ horizontal: "xs" }}>
      <Button
        type="button"
        onClick={handleCopy}
        aria-label="Copy share link"
        title="Copy a link that can be pasted into another Lens Desktop"
        $padding={{ horizontal: "s", vertical: "xxs" }}
        $style={{ fontFamily: "monospace", fontSize: "0.85em" }}
      >
        {copyLabel}
      </Button>
      <Button
        type="button"
        onClick={handleShare}
        aria-label="Share via system share sheet"
        title="Share a lens:// link externally"
        $padding={{ horizontal: "s", vertical: "xxs" }}
        $style={{ fontFamily: "monospace", fontSize: "0.85em" }}
      >
        Share
      </Button>
    </Div>
  );
};

type ClusterBreadcrumbProps = {
  readonly tabId: string;
  readonly clusterId: string;
  readonly fallbackClusterName: string;
  readonly resourcePath: string;
};

const ClusterBreadcrumb = observer(
  ({ tabId, clusterId, fallbackClusterName, resourcePath }: ClusterBreadcrumbProps) => {
    const displayName = useSyncInject(clusterDisplayNameInjectionToken, clusterId).get();
    const namespaces = useInjectAsReactive(selectedNamespacesForFilteringInjectionToken, { tabId, clusterId })
      .get()
      ?.get();
    const kubeObject = useInjectAsReactive(currentKubeObjectInDetailsOrUndefinedInjectionToken, tabId).get()?.get();

    const segments = synthesizeClusterBreadcrumb({
      clusterName: displayName ?? fallbackClusterName,
      namespaces,
      resourcePath,
      resourceName: kubeObject?.metadata.name,
    });

    const resourcePluralName = pluralNameFromResourcePath(resourcePath);
    const namespace = singleNamespaceOrUndefined(namespaces);

    return (
      <Div $flex={{ direction: "horizontal", verticalAlign: "center" }} $overflow="hidden" $style={{ minWidth: 0 }}>
        <Div
          $flex={{ direction: "horizontal", verticalAlign: "center" }}
          $overflow="hidden"
          $style={{ minWidth: 0, flex: 1 }}
        >
          <EditableLocationBar segments={segments} />
        </Div>
        <ClusterToolbarActions
          clusterId={clusterId}
          resourcePluralName={resourcePluralName}
          namespace={namespace}
          resourceName={kubeObject?.metadata.name}
          resourceSelfLink={kubeObject?.metadata.selfLink}
        />
      </Div>
    );
  },
);

const LocationBar = observer(() => {
  const activeClusterEntity = useSyncInject(activeClusterEntityForSelectedTabInjectionToken).get();
  const selectedClusterTab = useInjectAsReactive(selectedClusterTabInjectionToken).get()?.get();
  const selectedTab = useSyncInject(selectedTabReactiveInjectionToken).get();

  if (!activeClusterEntity || !selectedClusterTab) {
    const label = selectedTab ? labelForTabType(selectedTab.type) : defaultNonClusterLabel;

    return <EditableLocationBar segments={[label]} />;
  }

  return (
    <ClusterBreadcrumb
      tabId={selectedClusterTab.tabId}
      clusterId={selectedClusterTab.clusterId}
      fallbackClusterName={activeClusterEntity.metadata.name}
      resourcePath={selectedClusterTab.kubeResource}
    />
  );
});

const locationBarInjectable = getInjectable({
  id: "url-navigation-and-sharing-location-bar",

  instantiate: () => ({
    Component: LocationBar,
    orderNumber: locationBarOrderNumber,
  }),

  injectionToken: leftItemInjectionToken,
});

export default locationBarInjectable;

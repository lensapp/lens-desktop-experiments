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
import { ClickableDiv, Div, Form, Input, Span } from "@lensapp/element-components";
import { observer } from "mobx-react";
import React, { useCallback, useState } from "react";
import { synthesizeClusterBreadcrumb } from "./synthesize-breadcrumb";
import { labelForTabType } from "./label-for-tab-type";
import { parseLocationBarInput } from "./parse-location-bar-input";
import { isLensUrl, parseLensUrl } from "./parse-lens-url";
import {
  type NavigationFailure,
  navigateFromLocationInputInjectionToken,
} from "./navigate-from-location-input.injectable";
import { navigateFromLensUrlInjectionToken } from "./navigate-from-lens-url.injectable";

const locationBarOrderNumber = 100;
const segmentSeparator = "/";
const defaultNonClusterLabel = "Lens";

const failureMessage = (failure: NavigationFailure): string => {
  switch (failure.kind) {
    case "cluster-not-found":
      return `Cluster "${failure.clusterName}" not found`;
    case "resource-type-not-found":
      return `Resource type "${failure.resourcePluralName}" not found`;
  }
};

type LocationBarViewProps = {
  readonly segments: readonly string[];
  readonly onEditRequested?: () => void;
};

const LocationBarView = ({ segments, onEditRequested }: LocationBarViewProps) => {
  const content = (
    <>
      {segments.map((segment, index) => (
        <React.Fragment key={index}>
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

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      onSubmit(value);
    },
    [onSubmit, value],
  );

  // Paste of a lens:// URL submits immediately: the user isn't authoring a
  // path, they're handing off a shareable link and expect navigation.
  const handlePaste = useCallback(
    (event: React.ClipboardEvent<HTMLInputElement>) => {
      const pasted = event.clipboardData.getData("text");

      if (isLensUrl(pasted)) {
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
        onBlur={onCancel}
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
        <Span role="alert" $style={{ color: "var(--colorError, #e53935)", whiteSpace: "nowrap" }}>
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
  const navigateFromLensUrl = useSyncInject(navigateFromLensUrlInjectionToken);
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
      if (isLensUrl(value)) {
        const lensUrl = parseLensUrl(value);

        if (!lensUrl) {
          setErrorMessage("Malformed lens:// URL");
          return;
        }

        await navigateFromLensUrl(lensUrl);
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
    [navigate, navigateFromLensUrl],
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

    return <EditableLocationBar segments={segments} />;
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

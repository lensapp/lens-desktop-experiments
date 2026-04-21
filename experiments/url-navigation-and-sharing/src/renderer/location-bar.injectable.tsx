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
import { Button, ClickableDiv, Div, Form, Input, Li, Span, Ul } from "@lensapp/element-components";
import { CheckIcon, ContentCopyIcon, ShareIcon } from "@lensapp/icon";
import { clustersInjectionToken } from "@lensapp/cluster-source";
import { allNamespacesInjectionToken } from "@lensapp/selecting-namespaces";
import { copyToClipboardInjectionToken } from "@lensapp/electron";
import { showErrorNotificationInjectionToken } from "@lensapp/notifications";
import { isMacInjectable } from "@lensapp/vars";
import type { Entity } from "@lensapp/entity-aggregator";
import { observer } from "mobx-react";
import React, { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { synthesizeClusterBreadcrumb } from "./synthesize-breadcrumb";
import { labelForTabType } from "./label-for-tab-type";
import { parseLocationBarInput } from "./parse-location-bar-input";
import { formatShareLink, isShareLink, parseShareLink } from "./parse-share-link";
import { getActiveSegment } from "./caret-segment";
import {
  suggestClusters,
  suggestNamespaces,
  suggestResourcePlurals,
  type Suggestion,
} from "./location-bar-suggestions";
import { registeredResourcePluralsInjectionToken } from "./registered-resource-plurals.injectable";
import {
  type NavigationFailure,
  navigateFromLocationInputInjectionToken,
} from "./navigate-from-location-input.injectable";
import {
  type ShareLinkNavigationFailure,
  navigateFromShareLinkInjectionToken,
} from "./navigate-from-share-link.injectable";
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

const shareLinkFailureMessage = (failure: ShareLinkNavigationFailure): string => {
  switch (failure.kind) {
    case "cluster-not-found":
      return `Cluster from "${failure.sourceSlug}" link not found in this Lens`;
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

type SuggestionsListboxProps = {
  readonly listboxId: string;
  readonly suggestions: readonly Suggestion[];
  readonly activeIndex: number;
  readonly onPick: (suggestion: Suggestion) => void;
};

const SuggestionsListbox = ({ listboxId, suggestions, activeIndex, onPick }: SuggestionsListboxProps) => (
  <Ul
    id={listboxId}
    role="listbox"
    $style={{
      position: "absolute",
      top: "calc(100% + 2px)",
      left: 0,
      right: 0,
      margin: 0,
      padding: "4px 0",
      listStyle: "none",
      background: "var(--colorBackgroundSecondary, var(--colorPrimary))",
      border: "1px solid var(--colorBorderPrimary, rgba(127,127,127,0.3))",
      borderRadius: "4px",
      boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
      maxHeight: "16rem",
      overflowY: "auto",
      zIndex: 1000,
    }}
  >
    {suggestions.map((suggestion, index) => {
      const optionId = `${listboxId}-option-${index}`;

      return (
        <Li
          key={optionId}
          id={optionId}
          role="option"
          aria-selected={index === activeIndex}
          onMouseDown={(event: React.MouseEvent<HTMLLIElement>) => {
            event.preventDefault();
            onPick(suggestion);
          }}
          $style={{
            padding: "4px 12px",
            cursor: "pointer",
            background:
              index === activeIndex ? "var(--colorBackgroundTertiary, rgba(127,127,127,0.15))" : "transparent",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {suggestion.label}
        </Li>
      );
    })}
  </Ul>
);

type NamespaceSuggestionsProps = {
  readonly clusterId: string;
  readonly query: string;
  readonly listboxId: string;
  readonly activeIndex: number;
  readonly onPick: (suggestion: Suggestion) => void;
  readonly onSuggestionsChange: (suggestions: readonly Suggestion[]) => void;
};

const NamespaceSuggestions = observer(
  ({ clusterId, query, listboxId, activeIndex, onPick, onSuggestionsChange }: NamespaceSuggestionsProps) => {
    const namespaces = useSyncInject(allNamespacesInjectionToken, clusterId).get();
    const suggestions = useMemo(() => suggestNamespaces(namespaces, query), [namespaces, query]);

    useEffect(() => {
      onSuggestionsChange(suggestions);
    }, [suggestions, onSuggestionsChange]);

    if (suggestions.length === 0) {
      return null;
    }

    return (
      <SuggestionsListbox listboxId={listboxId} suggestions={suggestions} activeIndex={activeIndex} onPick={onPick} />
    );
  },
);

const insertSuggestionIntoInput = (
  value: string,
  rangeStart: number,
  rangeEnd: number,
  insertText: string,
): { readonly nextValue: string; readonly nextCaret: number } => {
  const before = value.slice(0, rangeStart);
  const after = value.slice(rangeEnd);
  const leading = before.endsWith(" ") || before.length === 0 ? "" : " ";
  const trailing = after.startsWith(" ") || after.length === 0 ? "" : " ";
  const inserted = `${leading}${insertText}${trailing}`;
  const nextValue = `${before}${inserted}${after}`;
  const nextCaret = before.length + leading.length + insertText.length;

  return { nextValue, nextCaret };
};

const LocationBarInput = observer(({ initialValue, errorMessage, onSubmit, onCancel }: LocationBarInputProps) => {
  const clusters = useSyncInject(clustersInjectionToken).get();
  const registeredPlurals = useSyncInject(registeredResourcePluralsInjectionToken);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();
  const [value, setValue] = useState(initialValue);
  const [caret, setCaret] = useState(initialValue.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [namespaceSuggestions, setNamespaceSuggestions] = useState<readonly Suggestion[]>([]);
  const [suppressDropdown, setSuppressDropdown] = useState(false);

  const activeSegment = getActiveSegment(value, caret);
  const parsed = parseLocationBarInput(value);
  const resolvedClusterId = parsed
    ? clusters.find((candidate) => candidate.name === parsed.clusterName)?.id
    : undefined;
  const clusterNames = useMemo(() => clusters.map((cluster) => cluster.name), [clusters]);

  const staticSuggestions = useMemo<readonly Suggestion[]>(() => {
    if (suppressDropdown) {
      return [];
    }

    if (activeSegment.index === 0) {
      return suggestClusters(clusterNames, activeSegment.text);
    }

    if (activeSegment.index === 2) {
      return suggestResourcePlurals(registeredPlurals, activeSegment.text);
    }

    return [];
  }, [suppressDropdown, activeSegment.index, activeSegment.text, clusterNames, registeredPlurals]);

  const showNamespaceDropdown = !suppressDropdown && activeSegment.index === 1 && resolvedClusterId !== undefined;

  const activeSuggestions: readonly Suggestion[] = showNamespaceDropdown ? namespaceSuggestions : staticSuggestions;

  useEffect(() => {
    setActiveIndex((previous) => {
      if (activeSuggestions.length === 0) {
        return 0;
      }

      return Math.min(previous, activeSuggestions.length - 1);
    });
  }, [activeSuggestions.length]);

  const updateCaretFromInput = useCallback(() => {
    const input = inputRef.current;

    if (!input) {
      return;
    }

    setCaret(input.selectionStart ?? input.value.length);
  }, []);

  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    setCaret(event.target.selectionStart ?? event.target.value.length);
    setSuppressDropdown(false);
  }, []);

  const handleSelect = useCallback(() => {
    updateCaretFromInput();
  }, [updateCaretFromInput]);

  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = event.clipboardData.getData("text");

    if (isShareLink(pasted)) {
      setSuppressDropdown(true);
    }
  }, []);

  const acceptSuggestion = useCallback(
    (suggestion: Suggestion) => {
      const { nextValue, nextCaret } = insertSuggestionIntoInput(
        value,
        activeSegment.rangeStart,
        activeSegment.rangeEnd,
        suggestion.insertText,
      );

      setValue(nextValue);
      setCaret(nextCaret);
      setActiveIndex(0);

      const input = inputRef.current;

      if (input) {
        window.requestAnimationFrame(() => {
          input.focus();
          input.setSelectionRange(nextCaret, nextCaret);
        });
      }
    },
    [value, activeSegment.rangeStart, activeSegment.rangeEnd],
  );

  const dropdownIsOpen = activeSuggestions.length > 0;

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();

        if (dropdownIsOpen) {
          setSuppressDropdown(true);
          return;
        }

        onCancel();
        return;
      }

      if (!dropdownIsOpen) {
        return;
      }

      if (event.key === "ArrowDown") {
        event.preventDefault();
        setActiveIndex((previous) => (previous + 1) % activeSuggestions.length);
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        setActiveIndex((previous) => (previous - 1 + activeSuggestions.length) % activeSuggestions.length);
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();

        const pickable = activeSuggestions[activeIndex];

        if (pickable) {
          acceptSuggestion(pickable);
        }
      }
    },
    [dropdownIsOpen, activeSuggestions, activeIndex, acceptSuggestion, onCancel],
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

      if (dropdownIsOpen) {
        const pickable = activeSuggestions[activeIndex];

        if (pickable) {
          acceptSuggestion(pickable);
          return;
        }
      }

      onSubmit(value);
    },
    [dropdownIsOpen, activeSuggestions, activeIndex, acceptSuggestion, onSubmit, value],
  );

  const activeDescendantId = dropdownIsOpen ? `${listboxId}-option-${activeIndex}` : undefined;

  return (
    <Form
      onSubmit={handleSubmit}
      onBlur={handleBlur}
      $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xs" }}
      $padding={{ horizontal: "s" }}
      $style={{ fontFamily: "monospace", width: "min(40rem, 60vw)" }}
    >
      <Div $relative $style={{ flex: 1, minWidth: 0 }}>
        <Input
          ref={inputRef}
          autoFocus
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onSelect={handleSelect}
          onPaste={handlePaste}
          aria-label="Location input"
          aria-invalid={errorMessage !== undefined}
          aria-autocomplete="list"
          role="combobox"
          aria-expanded={dropdownIsOpen}
          aria-controls={dropdownIsOpen ? listboxId : undefined}
          aria-activedescendant={activeDescendantId}
          $style={{
            fontFamily: "monospace",
            width: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            color: "inherit",
          }}
        />
        {staticSuggestions.length > 0 && (
          <SuggestionsListbox
            listboxId={listboxId}
            suggestions={staticSuggestions}
            activeIndex={activeIndex}
            onPick={acceptSuggestion}
          />
        )}
        {showNamespaceDropdown && (
          <NamespaceSuggestions
            clusterId={resolvedClusterId as string}
            query={activeSegment.text}
            listboxId={listboxId}
            activeIndex={activeIndex}
            onPick={acceptSuggestion}
            onSuggestionsChange={setNamespaceSuggestions}
          />
        )}
      </Div>
      {errorMessage && (
        <Span role="alert" $style={{ color: "var(--colorError)", whiteSpace: "nowrap" }}>
          {errorMessage}
        </Span>
      )}
    </Form>
  );
});

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

        const failure = await navigateFromShareLink(parsed);

        if (failure) {
          setErrorMessage(shareLinkFailureMessage(failure));
          return;
        }

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
  readonly entity: Entity;
  readonly resourcePluralName: string | undefined;
  readonly namespace: string | undefined;
  readonly resourceName: string | undefined;
  readonly resourceSelfLink: string | undefined;
};

const copyStatusResetMs = 1500;

const ClusterToolbarActions = ({
  entity,
  resourcePluralName,
  namespace,
  resourceName,
  resourceSelfLink,
}: ClusterToolbarActionsProps) => {
  const resolveClusterShareInfo = useSyncInject(resolveClusterShareInfoInjectionToken);
  const openShareMenu = useSyncInject(openShareMenuInjectionToken);
  const copyToClipboard = useSyncInject(copyToClipboardInjectionToken);
  const showErrorNotification = useSyncInject(showErrorNotificationInjectionToken);
  const isMac = useSyncInject(isMacInjectable);
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (status !== "copied") {
      return;
    }

    const handle = setTimeout(() => setStatus("idle"), copyStatusResetMs);

    return () => clearTimeout(handle);
  }, [status]);

  const handleCopy = useCallback(async () => {
    const result = await resolveClusterShareInfo(entity);

    if (result.kind === "error") {
      showErrorNotification(result.message);
      return;
    }

    const text = formatShareLink({
      sourceSlug: result.info.sourceSlug,
      clusterSpecifier: result.info.clusterSpecifier,
      namespace,
      resourcePluralName,
      resourceName,
    });

    copyToClipboard(text);
    setStatus("copied");
  }, [
    resolveClusterShareInfo,
    entity,
    namespace,
    resourcePluralName,
    resourceName,
    copyToClipboard,
    showErrorNotification,
  ]);

  const handleShare = useCallback(async () => {
    const result = await resolveClusterShareInfo(entity);

    if (result.kind === "error") {
      showErrorNotification(result.message);
      return;
    }

    const tail = resourcePluralName ? `/${resourcePluralName}` : "";
    const query: Record<string, string> = {};

    if (resourceSelfLink) {
      query[kubeDetailsUrlParamName] = resourceSelfLink;
    }

    const url = getCustomProtocolUrl({
      connectionType: result.info.connectionType,
      clusterSpecifier: result.info.clusterSpecifier,
      frame: "cluster",
      query,
      tail,
    });

    openShareMenu(url);
  }, [resolveClusterShareInfo, entity, resourcePluralName, resourceSelfLink, openShareMenu, showErrorNotification]);

  const copyTitle =
    status === "copied" ? "Copied to clipboard" : "Copy a link that can be pasted into another Lens Desktop";

  return (
    <Div $flex={{ direction: "horizontal", verticalAlign: "center", gap: "xxs" }} $padding={{ horizontal: "xs" }}>
      <Button
        type="button"
        onClick={handleCopy}
        aria-label="Copy share link"
        title={copyTitle}
        $padding="xxs"
        $style={{ background: "transparent", border: "none", display: "inline-flex", alignItems: "center" }}
      >
        {status === "copied" ? <CheckIcon $size="s" /> : <ContentCopyIcon $size="s" />}
      </Button>
      {isMac && (
        <Button
          type="button"
          onClick={handleShare}
          aria-label="Share via system share sheet"
          title="Share a lens:// link externally"
          $padding="xxs"
          $style={{ background: "transparent", border: "none", display: "inline-flex", alignItems: "center" }}
        >
          <ShareIcon $size="s" />
        </Button>
      )}
    </Div>
  );
};

type ClusterBreadcrumbProps = {
  readonly tabId: string;
  readonly clusterId: string;
  readonly entity: Entity;
  readonly resourcePath: string;
};

const ClusterBreadcrumb = observer(({ tabId, clusterId, entity, resourcePath }: ClusterBreadcrumbProps) => {
  const displayName = useSyncInject(clusterDisplayNameInjectionToken, clusterId).get();
  const namespaces = useInjectAsReactive(selectedNamespacesForFilteringInjectionToken, { tabId, clusterId })
    .get()
    ?.get();
  const kubeObject = useInjectAsReactive(currentKubeObjectInDetailsOrUndefinedInjectionToken, tabId).get()?.get();

  const segments = synthesizeClusterBreadcrumb({
    clusterName: displayName ?? entity.metadata.name,
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
        entity={entity}
        resourcePluralName={resourcePluralName}
        namespace={namespace}
        resourceName={kubeObject?.metadata.name}
        resourceSelfLink={kubeObject?.metadata.selfLink}
      />
    </Div>
  );
});

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
      entity={activeClusterEntity}
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

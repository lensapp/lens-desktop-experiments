import { copyToClipboardInjectionToken } from "@lensapp/electron";
import type { Entity } from "@lensapp/entity-aggregator";
import { showErrorNotificationInjectionToken } from "@lensapp/notifications";
import { getCustomProtocolUrl } from "@lensapp/share-common";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { isMacInjectable } from "@lensapp/vars";
import { useCallback } from "react";
import { resolveClusterShareInfoInjectionToken } from "./cluster-share-info.injectable";
import { openShareMenuInjectionToken } from "./open-share-menu.injectable";
import { formatShareLink } from "../_shared/parse-share-link";
import sendLocationBarTelemetryInjectable from "../telemetry/send-location-bar-telemetry.injectable";

const kubeDetailsUrlParamName = "kube-details";

export type ClusterToolbarActionArgs = {
  readonly entity: Entity;
  readonly resourcePluralName: string | undefined;
  readonly namespaces: readonly string[] | undefined;
  readonly resourceName: string | undefined;
  readonly resourceSelfLink: string | undefined;
};

export type ClusterToolbarActionsModel = {
  readonly isMac: boolean;
  readonly copyShareLink: () => Promise<boolean>;
  readonly openSystemShareMenu: () => Promise<void>;
};

export const useClusterToolbarActionsModel = (args: ClusterToolbarActionArgs): ClusterToolbarActionsModel => {
  const resolveClusterShareInfo = useSyncInject(resolveClusterShareInfoInjectionToken);
  const openShareMenu = useSyncInject(openShareMenuInjectionToken);
  const copyToClipboard = useSyncInject(copyToClipboardInjectionToken);
  const showErrorNotification = useSyncInject(showErrorNotificationInjectionToken);
  const sendTelemetry = useSyncInject(sendLocationBarTelemetryInjectable);
  const isMac = useSyncInject(isMacInjectable);

  const { entity, resourcePluralName, namespaces, resourceName, resourceSelfLink } = args;

  const copyShareLink = useCallback(async (): Promise<boolean> => {
    const result = await resolveClusterShareInfo(entity);

    if (result.kind === "error") {
      showErrorNotification(result.message);
      return false;
    }

    const text = formatShareLink({
      sourceSlug: result.info.sourceSlug,
      clusterSpecifier: result.info.clusterSpecifier,
      namespaces,
      resourcePluralName,
      resourceName,
    });

    copyToClipboard(text);
    sendTelemetry({
      action: "share-link-copied",
      params: {
        hasResourceType: resourcePluralName !== undefined,
        namespaceCount: namespaces?.length ?? 0,
        hasResourceName: resourceName !== undefined,
      },
    });
    return true;
  }, [
    resolveClusterShareInfo,
    entity,
    namespaces,
    resourcePluralName,
    resourceName,
    copyToClipboard,
    showErrorNotification,
    sendTelemetry,
  ]);

  const openSystemShareMenu = useCallback(async (): Promise<void> => {
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
    sendTelemetry({
      action: "system-share-opened",
      params: {
        hasResourceType: resourcePluralName !== undefined,
        hasResourceName: resourceName !== undefined,
      },
    });
  }, [
    resolveClusterShareInfo,
    entity,
    resourcePluralName,
    resourceName,
    resourceSelfLink,
    openShareMenu,
    showErrorNotification,
    sendTelemetry,
  ]);

  return { isMac, copyShareLink, openSystemShareMenu };
};

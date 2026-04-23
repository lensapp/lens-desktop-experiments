import { getInjectable, getInjectionToken } from "@lensapp/injectable";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";
import { openShareMenuChannel } from "@lensapp/share-common";

export type OpenShareMenu = (url: string) => void;

export const openShareMenuInjectionToken = getInjectionToken<OpenShareMenu>({
  id: "url-navigation-and-sharing-open-share-menu",
});

// Mirrors the share-renderer helper (not publicly exported) that launches the
// OS share sheet. Forwarding through the same channel keeps feature parity
// with pod-share without reaching into private imports.
const openShareMenuInjectable = getInjectable({
  id: "url-navigation-and-sharing-open-share-menu-forwarder",

  instantiate: (di): OpenShareMenu => {
    const sendMessageToChannel = di.inject(sendMessageToChannelInjectionToken);

    return (url) => sendMessageToChannel(openShareMenuChannel, url);
  },

  injectionToken: openShareMenuInjectionToken,
});

export default openShareMenuInjectable;

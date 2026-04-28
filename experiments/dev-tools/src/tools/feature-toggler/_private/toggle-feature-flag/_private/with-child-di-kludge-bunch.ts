import { getInjectable2, getInjectableBunch, type Injectable, instantiationDecoratorToken } from "@lensapp/injectable";

import {
  getMessageChannel,
  getMessageChannelListenerInjectable,
  sendMessageToChannelInjectionToken,
} from "@lensapp/messaging";

export const withChildDiKludgeBunch = <T>(toBeKludged: Injectable<(arg: T) => void, unknown>) => {
  const kludgeChannel = getMessageChannel<T>(`multi-di-kludge-channel-for-${toBeKludged.id}`);

  return getInjectableBunch({
    kludgeSender: getInjectable2({
      id: `with-intercepted-sending-in-kludge-channel-for-${toBeKludged.id}`,
      injectionToken: instantiationDecoratorToken.for(toBeKludged),
      decorable: false,

      instantiate:
        () =>
        () =>
        (
          // Deliberately omit running the decorated function...
          _toBeDecorated,
        ) =>
        (senderDi) => {
          const sendMessageToChannel = senderDi.inject(sendMessageToChannelInjectionToken);

          // ...instead, send the message in the kludge channel, to be run by a listener
          return (message: T) => {
            sendMessageToChannel(kludgeChannel, message);
          };
        },
    }),

    kludgeListener: getMessageChannelListenerInjectable({
      id: `kludge-channel-listener-for-${toBeKludged.id}`,
      channel: kludgeChannel,
      getHandler: toBeKludged.instantiate,
    }),
  });
};

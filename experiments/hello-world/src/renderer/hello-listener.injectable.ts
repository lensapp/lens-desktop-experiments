import { getMessageChannelListenerInjectable } from "@lensapp/messaging";
import { helloChannel } from "../contracts/hello-channel";

export const helloListenerInjectable = getMessageChannelListenerInjectable({
  id: "hello-world-listener",
  channel: helloChannel,
  getHandler:
    () =>
    ({ greeting }) => {
      console.log(`[HelloWorld Experiment] Received: ${greeting}`);
    },
});
import { getInjectable } from "@lensapp/injectable";
import { afterApplicationIsLoadedInjectionToken } from "@lensapp/application";
import { sendMessageToChannelInjectionToken } from "@lensapp/messaging";
import { helloChannel } from "../contracts/hello-channel";

const helloOnLoadInjectable = getInjectable({
  id: "hello-world-on-load",

  instantiate: (di) => ({
    run: () => {
      const sendMessage = di.inject(sendMessageToChannelInjectionToken);

      sendMessage(helloChannel, { greeting: "Hello from the experiment!" });
    },
  }),

  injectionToken: afterApplicationIsLoadedInjectionToken,
});

export default helloOnLoadInjectable;
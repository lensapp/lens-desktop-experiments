import { getMessageChannel } from "@lensapp/messaging";

export interface HelloMessageArgs {
  readonly greeting: string;
}

export const helloChannel = getMessageChannel<HelloMessageArgs>("experiment-hello-world");
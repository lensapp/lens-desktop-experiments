import { helloChannel } from "./hello-channel";

describe("hello-channel", () => {
  it("has channel id 'experiment-hello-world'", () => {
    expect(helloChannel.id).toBe("experiment-hello-world");
  });
});

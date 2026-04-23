import { Button, Div } from "@lensapp/element-components";
import { CheckIcon, ContentCopyIcon, ShareIcon } from "@lensapp/icon";
import { useCallback, useEffect, useState } from "react";
import { type ClusterToolbarActionArgs, useClusterToolbarActionsModel } from "./use-cluster-toolbar-actions-model";

const copyStatusResetMs = 1500;

export const ClusterToolbarActions = (props: ClusterToolbarActionArgs) => {
  const model = useClusterToolbarActionsModel(props);
  const [status, setStatus] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (status !== "copied") {
      return;
    }

    const handle = setTimeout(() => setStatus("idle"), copyStatusResetMs);

    return () => clearTimeout(handle);
  }, [status]);

  const handleCopy = useCallback(async () => {
    const ok = await model.copyShareLink();

    if (ok) {
      setStatus("copied");
    }
  }, [model]);

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
      {model.isMac && (
        <Button
          type="button"
          onClick={model.openSystemShareMenu}
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

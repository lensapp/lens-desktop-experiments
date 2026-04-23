import { ClickableDiv, Div, Span } from "@lensapp/element-components";
import React from "react";

const segmentSeparator = "/";

type LocationBarViewProps = {
  readonly segments: readonly string[];
  readonly onEditRequested?: () => void;
};

export const LocationBarView = ({ segments, onEditRequested }: LocationBarViewProps) => {
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
        $flex={{ direction: "horizontal", verticalAlign: "center" }}
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
      $flex={{ direction: "horizontal", verticalAlign: "center" }}
      $padding={{ horizontal: "s" }}
      $overflow="hidden"
      $style={{ fontFamily: "monospace", minWidth: 0, cursor: "text" }}
    >
      {content}
    </ClickableDiv>
  );
};

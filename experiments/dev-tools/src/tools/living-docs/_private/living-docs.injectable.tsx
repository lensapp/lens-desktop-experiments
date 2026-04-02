import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { observer } from "mobx-react";
import { livingDocsItemsInjectable } from "./living-docs-items.injectable";
import { Div, H2, H3 } from "@lensapp/element-components";

export const LivingDocs = getInjectableComponent({
  id: "living-docs-component",
  Component: observer(() => {
    const components = useSyncInject(livingDocsItemsInjectable);

    const observedComponents = components.get();

    return (
      <Div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: 800,
          height: 500,
          transform: "translate(-50%, -50%)",
          zIndex: 999,
        }}
        $backgroundColor="backgroundSecondary"
        $border={{ width: true, color: "borderPrimary", radius: "l" }}
        $overflow={{ y: "scroll" }}
        $padding="l"
      >
        <H2 $textAlign="center" $font={{ size: "xl" }} $margin={{ bottom: "xl" }}>
          Living Docs
        </H2>

        {observedComponents.map(({ id, title, description, Component }) => (
          <Div
            key={id}
            $margin={{ bottom: "xl" }}
            $flex={{ direction: "vertical", gap: "xs" }}
            $border={{ color: "borderPrimary", width: "s", radius: "l" }}
            $padding="m"
            $backgroundColor="backgroundPrimaryDimmed"
          >
            <H3 data-living-docs-item-title-test={id} $margin={{ bottom: "s" }} $font={{ size: "l" }}>
              {title}
            </H3>
            {description && (
              <Div data-living-docs-item-description-test={id} $color="grey20" $margin={{ bottom: "m" }}>
                {description}
              </Div>
            )}
            <Component $flexChild />
          </Div>
        ))}
      </Div>
    );
  }),
});

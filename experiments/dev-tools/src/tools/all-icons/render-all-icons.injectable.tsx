import { Div, Input } from "@lensapp/element-components";
import { getInjectableComponent } from "@lensapp/injectable-react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import * as allExportsFromIcon from "@lensapp/icon";
import { isValidElementType } from "react-is";
import { useMemo, useState } from "react";
import { observer } from "mobx-react";
import { getInjectable } from "@lensapp/injectable";

export const AllExportsFromIconInjectable = getInjectable({
  id: "icon-components",

  instantiate: () => allExportsFromIcon,
});

export const AllIcons = getInjectableComponent({
  id: "all-icons-component",

  Component: observer(() => {
    const allExports = useSyncInject(AllExportsFromIconInjectable);

    const IconComponents = Object.values(allExports).filter((x) =>
      isValidElementType(x),
    ) as any as React.ComponentType<any>[];

    const [search, setSearch] = useState("");

    const filteredIcons = useMemo(() => {
      if (!search) {
        return IconComponents;
      }

      const pattern = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      return IconComponents.filter((x) => {
        return new RegExp(pattern, "i").test(x.name);
      });
    }, [search, IconComponents]);

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
        <Input
          placeholder="Search..."
          $width="full"
          type="text"
          onChange={(x) => setSearch(x.target.value)}
          $padding="xs"
          $border={{ width: true, color: "borderPrimary", radius: "m" }}
          value={search}
          data-icon-search-input-test
        />
        <Div
          $margin={{ top: "l" }}
          $flex={{
            direction: "horizontal",
            verticalAlign: "center",
            horizontalAlign: "center",
            gap: "l",
          }}
          $style={{ flexWrap: "wrap" }}
        >
          {filteredIcons.map((Component, i) => (
            <Div
              key={i}
              $backgroundColor="backgroundPrimary"
              $border={{ width: true, color: "borderPrimary", radius: "l" }}
              $tooltip={Component.name as any}
              data-icon-test={Component.name}
            >
              <Component $size="11xl" />
            </Div>
          ))}
        </Div>
      </Div>
    );
  }),
});

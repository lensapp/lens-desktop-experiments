import { Div, Span } from "@lensapp/element-components";
import { Heading, SectionBlock, SectionBlockSeparator, SectionGroup } from "@lensapp/presentational-components";
import { observer } from "mobx-react";
import { useState } from "react";
import { useSyncInject } from "@lensapp/use-sync-inject";
import { useInjectAsReactive } from "@lensapp/use-inject-as-reactive";
import { activeThemeInjectable } from "@lensapp/theme-renderer";
import { customDarkColorsInjectable, customLightColorsInjectable } from "../state/custom-theme-colors.injectable";
import { customDarkBaselineInjectable, customLightBaselineInjectable } from "../state/custom-theme-baseline.injectable";
import { customThemeModeInjectable } from "../state/custom-theme-mode.injectable";
import { savedThemesInjectable } from "../state/saved-themes.injectable";
import { themeTweakerActionsInjectable } from "./manage/theme-tweaker-actions.injectable";
import { activePresetIdsInjectable } from "./preset-gallery/active-preset-ids.injectable";
import { ModeToggle } from "./mode/mode-toggle";
import { PresetFilterBar, PresetGallery, type PresetFilter } from "./preset-gallery/preset-gallery";
import { SavedThemesList } from "./saved-themes/saved-themes-list";
import { QuickPaletteGrid } from "./quick-palette/quick-palette-grid";
import { ColorTweakerGrid } from "./all-slots/color-tweaker-grid";
import { ManageBar } from "./manage/manage-bar";

export const ThemeTweakerPage = observer(() => {
  const darkColors = useInjectAsReactive(customDarkColorsInjectable).get();
  const lightColors = useInjectAsReactive(customLightColorsInjectable).get();
  const darkBaseline = useInjectAsReactive(customDarkBaselineInjectable).get();
  const lightBaseline = useInjectAsReactive(customLightBaselineInjectable).get();
  const mode = useInjectAsReactive(customThemeModeInjectable).get();
  const savedThemes = useInjectAsReactive(savedThemesInjectable).get();
  const actions = useInjectAsReactive(themeTweakerActionsInjectable).get();
  const activePresetIds = useInjectAsReactive(activePresetIdsInjectable).get();
  const activeTheme = useSyncInject(activeThemeInjectable);

  const [pendingName, setPendingName] = useState("");
  const [presetFilter, setPresetFilter] = useState<PresetFilter>("all");

  if (
    !darkColors ||
    !lightColors ||
    !darkBaseline ||
    !lightBaseline ||
    !mode ||
    !savedThemes ||
    !actions ||
    !activePresetIds
  ) {
    return null;
  }

  const currentMode = mode.get();
  const activeMap = currentMode === "light" ? lightColors : darkColors;
  const activeBaseline = currentMode === "light" ? lightBaseline : darkBaseline;

  return (
    <>
      <Heading.Page $margin={{ bottom: "s" }}>Theme Tweaker</Heading.Page>
      <Div $margin={{ bottom: "xl" }} $font={{ size: "s" }} $color="grey80">
        Pick a preset, tweak every color live, save your favourites. Currently active:{" "}
        <Span $color="textHighlight">{activeTheme.get().name}</Span>
      </Div>

      <SectionGroup>
        <SectionBlock $padding="m" $border={{ width: "xxs", color: "grey60", radius: "s" }}>
          <SectionBlock.Title>Mode</SectionBlock.Title>
          <SectionBlock.Content>
            <ModeToggle mode={currentMode} onChange={actions.setMode} />
          </SectionBlock.Content>
        </SectionBlock>

        <SectionBlockSeparator />

        <SectionBlock $padding="m" $border={{ width: "xxs", color: "grey60", radius: "s" }}>
          <Div
            $flex={{
              direction: "horizontal",
              verticalAlign: "center",
              horizontalAlign: "space-between",
              gap: "s",
              wrap: true,
            }}
          >
            <SectionBlock.Title>Preset themes</SectionBlock.Title>
            <PresetFilterBar filter={presetFilter} onChange={setPresetFilter} />
          </Div>
          <SectionBlock.Content>
            <PresetGallery
              activePresetIds={activePresetIds.get()}
              onApply={actions.applyPreset}
              filterType={presetFilter}
            />
          </SectionBlock.Content>
        </SectionBlock>

        <SectionBlockSeparator />

        <SectionBlock $padding="m" $border={{ width: "xxs", color: "grey60", radius: "s" }}>
          <SectionBlock.Title>Quick palette</SectionBlock.Title>
          <SectionBlock.Content>
            <QuickPaletteGrid colorsState={activeMap} />
          </SectionBlock.Content>
        </SectionBlock>

        <SectionBlockSeparator />

        <SectionBlock $padding="m" $border={{ width: "xxs", color: "grey60", radius: "s" }}>
          <SectionBlock.Title>{`All slots · ${activeMap.size} colors · ${currentMode}`}</SectionBlock.Title>
          <SectionBlock.Content>
            <ColorTweakerGrid
              colorsState={activeMap}
              baselineState={activeBaseline}
              currentMode={currentMode}
              actions={actions}
            />
          </SectionBlock.Content>
        </SectionBlock>

        <SectionBlockSeparator />

        <SectionBlock $padding="m" $border={{ width: "xxs", color: "grey60", radius: "s" }}>
          <SectionBlock.Title>Manage</SectionBlock.Title>
          <SectionBlock.Content>
            <ManageBar
              currentMode={currentMode}
              actions={actions}
              pendingName={pendingName}
              onPendingNameChange={setPendingName}
            />
          </SectionBlock.Content>
        </SectionBlock>

        <SectionBlockSeparator />

        <SectionBlock $padding="m" $border={{ width: "xxs", color: "grey60", radius: "s" }}>
          <SectionBlock.Title>Saved themes</SectionBlock.Title>
          <SectionBlock.Content>
            <SavedThemesList
              savedThemes={savedThemes}
              onApply={actions.applySavedTheme}
              onDelete={actions.deleteSaved}
            />
          </SectionBlock.Content>
        </SectionBlock>
      </SectionGroup>
    </>
  );
});

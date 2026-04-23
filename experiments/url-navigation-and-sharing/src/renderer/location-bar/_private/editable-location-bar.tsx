import { observer } from "mobx-react";
import { LocationBarInput } from "./edit-mode/input/location-bar-input";
import { useEditableLocationBarModel } from "./use-editable-location-bar-model";
import { LocationBarView } from "./view-mode/location-bar-view";

const segmentSeparator = "/";

type EditableLocationBarProps = {
  readonly segments: readonly string[];
  readonly editableSegments?: readonly string[];
};

export const EditableLocationBar = observer(({ segments, editableSegments }: EditableLocationBarProps) => {
  const model = useEditableLocationBarModel();

  if (model.isEditing) {
    return (
      <LocationBarInput
        initialValue={(editableSegments ?? segments).join(segmentSeparator)}
        errorMessage={model.errorMessage}
        onSubmit={model.submitEdit}
        onFinish={model.finishEdit}
        onCancel={model.cancelEdit}
      />
    );
  }

  return <LocationBarView segments={segments} onEditRequested={model.beginEdit} />;
});

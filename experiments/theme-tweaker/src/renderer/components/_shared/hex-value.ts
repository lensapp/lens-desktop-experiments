export const hexValueOrFallback = (value: string | undefined): string => {
  if (!value) {
    return "#000000";
  }
  if (/^#[0-9a-fA-F]{6}$/.test(value)) {
    return value;
  }
  if (/^#[0-9a-fA-F]{8}$/.test(value)) {
    return value.slice(0, 7);
  }
  return "#000000";
};

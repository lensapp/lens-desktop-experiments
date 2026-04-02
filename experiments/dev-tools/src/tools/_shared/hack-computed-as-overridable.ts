import { getAtom, type IComputedValue } from "mobx";

export const hackComputedAsOverridable = <T>(toBeHacked: IComputedValue<T>) => {
  const hackAtom = getAtom(toBeHacked);

  let overriddenValue: T;

  // Patch the derivation so recomputation yields our value when active
  // @ts-expect-error
  hackAtom.derivation = () => overriddenValue;

  const setOverride = (value: T) => {
    overriddenValue = value;

    // Hack into internals of the computed to make it appear stale and changed,
    // and therefore, trigger the observers of the computed to observe the new hacked value.
    // Ok for a dev-tool, **not** for production.
    // @ts-expect-error
    hackAtom.dependenciesState_ = 2;

    // @ts-expect-error
    hackAtom.onBecomeStale_();
  };

  return { setOverride };
};

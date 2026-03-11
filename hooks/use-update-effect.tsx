import { useEffect, useRef, DependencyList, EffectCallback } from "react";

/**
 * A custom useEffect hook that ignores the initial render.
 * @param effect The effect logic to run on updates.
 * @param dependencies The dependency array.
 */
export function useUpdateEffect(
  effect: EffectCallback,
  dependencies?: DependencyList,
): void {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else {
      return effect();
    }
    // We disable the exhaustive-deps rule here because the hook
    // is designed to be a transparent wrapper for useEffect.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
}

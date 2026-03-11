import type { ExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

export function sanitizeExcalidrawElements(
  elements: readonly ExcalidrawElement[] | null | undefined
): ExcalidrawElement[] {
  if (!elements || !Array.isArray(elements)) {
    return [];
  }

  const isFiniteNumber = (value: unknown): value is number =>
    typeof value === "number" && Number.isFinite(value);

  const hasValidPoint = (point: unknown): boolean => {
    if (!Array.isArray(point) || point.length < 2) return false;
    return isFiniteNumber(point[0]) && isFiniteNumber(point[1]);
  };

  return elements.filter((el): el is ExcalidrawElement => {
    if (!el || typeof el !== "object") return false;
    if (!("type" in el) || typeof (el as any).type !== "string") return false;

    const anyEl = el as any;

    if (!isFiniteNumber(anyEl.x) || !isFiniteNumber(anyEl.y)) return false;
    if (!isFiniteNumber(anyEl.width) || !isFiniteNumber(anyEl.height)) return false;

    if ("points" in anyEl) {
      if (!Array.isArray(anyEl.points)) return false;
      if (!anyEl.points.every(hasValidPoint)) return false;
    }

    if ("path" in anyEl && typeof anyEl.path !== "string") return false;
    if (
      anyEl.type === "path" &&
      (typeof anyEl.path !== "string" || anyEl.path.trim().length === 0)
    ) {
      return false;
    }
    if (
      (anyEl.type === "line" ||
        anyEl.type === "arrow" ||
        anyEl.type === "freedraw") &&
      (!Array.isArray(anyEl.points) || !anyEl.points.every(hasValidPoint))
    ) {
      return false;
    }
    if (anyEl.type === "text" && typeof anyEl.text !== "string") return false;

    return true;
  });
}

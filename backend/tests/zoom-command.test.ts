import { describe, expect, it } from "bun:test";
import { normalizeZoomActions } from "../src/services/zoom-command.service";
import type { PlannerRequest } from "../src/validators/action.validator";

function makeRequest(command: string, zoom = 1): PlannerRequest {
  return {
    boardId: "board-1",
    command,
    screenshot:
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    nodes: [
      {
        id: "backend-node",
        position: { x: 300, y: 200 },
        width: 120,
        height: 80,
        data: { label: "Backend Node" },
      } as any,
    ],
    viewport: { x: 0, y: 0, zoom },
  };
}

describe("zoom-command normalization", () => {
  it("translates zoom 200%", () => {
    const request = makeRequest("zoom 200%");
    const actions = normalizeZoomActions([], request);
    expect(actions[0]?.type).toBe("zoom");
    expect((actions[0] as any).level).toBe(2);
  });

  it("translates zoom 50%", () => {
    const request = makeRequest("zoom 50%");
    const actions = normalizeZoomActions([], request);
    expect((actions[0] as any).level).toBe(0.5);
  });

  it("translates zoom in/out using current viewport", () => {
    const zoomIn = normalizeZoomActions([], makeRequest("zoom in", 1.5));
    const zoomOut = normalizeZoomActions([], makeRequest("zoom out", 1.5));

    expect((zoomIn[0] as any).level).toBeCloseTo(1.8, 5);
    expect((zoomOut[0] as any).level).toBeCloseTo(1.25, 5);
  });

  it("resolves node center for node-target commands", () => {
    const actions = normalizeZoomActions([], makeRequest("100% zoom at backend node"));
    expect((actions[0] as any).level).toBe(1);
    expect((actions[0] as any).center).toEqual({ x: 360, y: 240 });
  });

  it("supports '100% at the backend node' phrasing", () => {
    const actions = normalizeZoomActions([], makeRequest("100% at the backend node"));
    expect((actions[0] as any).type).toBe("zoom");
    expect((actions[0] as any).level).toBe(1);
    expect((actions[0] as any).center).toEqual({ x: 360, y: 240 });
  });

  it("supports center backend node", () => {
    const actions = normalizeZoomActions([], makeRequest("center backend node", 0.8));
    expect((actions[0] as any).type).toBe("zoom");
    expect((actions[0] as any).center).toEqual({ x: 360, y: 240 });
    expect((actions[0] as any).level).toBe(1.2);
  });
});

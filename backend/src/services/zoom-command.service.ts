import type { Action, PlannerRequest } from "../validators/action.validator";

function clampZoom(level: number): number {
  return Math.max(0.1, Math.min(4, level));
}

function nodeCenter(node: any): { x: number; y: number } | undefined {
  const pos = node?.position;
  if (!pos || typeof pos.x !== "number" || typeof pos.y !== "number") return undefined;
  const width =
    (typeof node.width === "number" ? node.width : undefined) ??
    (typeof node.measured?.width === "number" ? node.measured.width : undefined) ??
    0;
  const height =
    (typeof node.height === "number" ? node.height : undefined) ??
    (typeof node.measured?.height === "number" ? node.measured.height : undefined) ??
    0;
  return {
    x: pos.x + width / 2,
    y: pos.y + height / 2,
  };
}

function resolveNodeFromCommand(command: string, nodes: any[]): any | undefined {
  const normalized = command.toLowerCase();
  let best: { node: any; score: number } | undefined;

  for (const node of nodes) {
    let score = 0;
    const id = String(node?.id ?? "").toLowerCase();
    const label = String(node?.data?.label ?? "").toLowerCase();

    if (id && normalized.includes(id)) score += 5;
    if (label && normalized.includes(label)) score += 6;

    const labelTokens = label.split(/[\s_-]+/).filter((t) => t.length > 2);
    for (const token of labelTokens) {
      if (normalized.includes(token)) score += 1;
    }

    if (!best || score > best.score) {
      best = { node, score };
    }
  }

  return best && best.score > 0 ? best.node : undefined;
}

function parseRequestedZoom(command: string, currentZoom: number): number | undefined {
  const normalized = command.toLowerCase();

  const percentMatch = normalized.match(/(\d+(?:\.\d+)?)\s*%/);
  if (percentMatch) {
    return Number(percentMatch[1]) / 100;
  }

  if (/\bzoom in\b/.test(normalized)) {
    return currentZoom * 1.2;
  }

  if (/\bzoom out\b/.test(normalized)) {
    return currentZoom / 1.2;
  }

  if (/\b100\s*%\s*zoom\b/.test(normalized)) {
    return 1.0;
  }

  return undefined;
}

function hasZoomIntent(command: string): boolean {
  const normalized = command.toLowerCase();
  return (
    /(\d+(?:\.\d+)?)\s*%/.test(normalized) ||
    /\bzoom\b/.test(normalized) ||
    /\bfit node\b/.test(normalized) ||
    /\bfocus(?:\s+\w+)?\s+node\b/.test(normalized) ||
    /\bzoom to node\b/.test(normalized) ||
    /\bcenter(?:\s+\w+)?\s+node\b/.test(normalized)
  );
}

function isNodeFocusIntent(command: string): boolean {
  const normalized = command.toLowerCase();
  return (
    /\bfit node\b/.test(normalized) ||
    /\bfocus(?:\s+\w+)?\s+node\b/.test(normalized) ||
    /\bzoom to node\b/.test(normalized) ||
    /\bcenter(?:\s+\w+)?\s+node\b/.test(normalized)
  );
}

export function normalizeZoomActions(actions: Action[], input: PlannerRequest): Action[] {
  const currentViewport = input.viewport ?? { x: 0, y: 0, zoom: 1 };
  const requestedZoom = parseRequestedZoom(input.command, currentViewport.zoom);
  const nodeFocusIntent = isNodeFocusIntent(input.command);
  const referencedNode = resolveNodeFromCommand(input.command, input.nodes as any[]);
  const referencedCenter = referencedNode ? nodeCenter(referencedNode) : undefined;

  let hasZoomAction = false;

  const normalized = actions.map((action) => {
    if (action.type !== "zoom") return action;
    hasZoomAction = true;

    const fallbackCenter =
      action.center ||
      (action.nodeId
        ? nodeCenter((input.nodes as any[]).find((n) => n.id === action.nodeId))
        : undefined) ||
      referencedCenter;

    const level = clampZoom(
      typeof action.level === "number"
        ? action.level
        : requestedZoom ?? (nodeFocusIntent ? Math.max(currentViewport.zoom, 1.2) : currentViewport.zoom)
    );

    return {
      ...action,
      level,
      center: fallbackCenter,
    };
  });

  if (!hasZoomAction && hasZoomIntent(input.command)) {
    normalized.push({
      type: "zoom",
      level: clampZoom(
        requestedZoom ?? (nodeFocusIntent ? Math.max(currentViewport.zoom, 1.2) : currentViewport.zoom)
      ),
      center: referencedCenter,
      ...(referencedNode ? { nodeId: referencedNode.id } : {}),
    });
  }

  return normalized;
}

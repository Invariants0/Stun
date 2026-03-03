type Position = { x: number; y: number };

type Action =
  | { type: "move"; nodeId: string; to: Position }
  | { type: "connect"; source: string; target: string }
  | { type: "highlight"; nodeId: string }
  | { type: "zoom"; level: number }
  | { type: "group"; nodeIds: string[] };

export function executeActions(actions: Action[]) {
  for (const action of actions) {
    switch (action.type) {
      case "move":
      case "connect":
      case "highlight":
      case "zoom":
      case "group":
        break;
      default:
        throw new Error(
          `Unsupported action type: ${(action as { type: string }).type}`,
        );
    }
  }
}

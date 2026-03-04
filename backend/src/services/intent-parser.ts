/**
 * Command Intent Parser
 * Lightweight rule-based classifier for user commands
 */

export type CommandIntent =
  | "summarize_canvas"
  | "generate_diagram"
  | "move_node"
  | "connect_nodes"
  | "organize_board"
  | "general_planning";

export interface ParsedIntent {
  intent: CommandIntent;
  confidence: "high" | "medium" | "low";
  keywords: string[];
}

/**
 * Parse user command and classify intent
 */
export function parseIntent(command: string): ParsedIntent {
  const lowerCommand = command.toLowerCase();

  // Summarize canvas patterns
  if (
    lowerCommand.includes("summarize") ||
    lowerCommand.includes("summary") ||
    lowerCommand.includes("overview") ||
    lowerCommand.includes("what's on") ||
    lowerCommand.includes("what is on")
  ) {
    return {
      intent: "summarize_canvas",
      confidence: "high",
      keywords: ["summarize", "summary", "overview"],
    };
  }

  // Generate diagram patterns
  if (
    (lowerCommand.includes("generate") || lowerCommand.includes("create")) &&
    (lowerCommand.includes("diagram") ||
      lowerCommand.includes("chart") ||
      lowerCommand.includes("graph") ||
      lowerCommand.includes("visualization"))
  ) {
    return {
      intent: "generate_diagram",
      confidence: "high",
      keywords: ["generate", "diagram", "chart"],
    };
  }

  // Move node patterns
  if (
    (lowerCommand.includes("move") ||
      lowerCommand.includes("reposition") ||
      lowerCommand.includes("shift")) &&
    (lowerCommand.includes("node") ||
      lowerCommand.includes("that") ||
      lowerCommand.includes("this") ||
      lowerCommand.match(/\d+\s*(px|pixels)/))
  ) {
    return {
      intent: "move_node",
      confidence: "high",
      keywords: ["move", "node", "position"],
    };
  }

  // Connect nodes patterns
  if (
    lowerCommand.includes("connect") ||
    lowerCommand.includes("link") ||
    (lowerCommand.includes("draw") && lowerCommand.includes("line"))
  ) {
    return {
      intent: "connect_nodes",
      confidence: "high",
      keywords: ["connect", "link"],
    };
  }

  // Organize board patterns
  if (
    lowerCommand.includes("organize") ||
    lowerCommand.includes("arrange") ||
    lowerCommand.includes("layout") ||
    lowerCommand.includes("tidy") ||
    lowerCommand.includes("clean up")
  ) {
    return {
      intent: "organize_board",
      confidence: "high",
      keywords: ["organize", "arrange", "layout"],
    };
  }

  // Default to general planning
  return {
    intent: "general_planning",
    confidence: "medium",
    keywords: [],
  };
}

/**
 * Get intent-specific guidance for AI prompt
 */
export function getIntentGuidance(intent: CommandIntent): string {
  switch (intent) {
    case "summarize_canvas":
      return "Focus on analyzing the canvas content and creating a summary node. Consider the spatial layout and relationships between existing nodes.";

    case "generate_diagram":
      return "Create a structured diagram with properly connected nodes. Use appropriate spacing and layout for clarity.";

    case "move_node":
      return "Calculate precise positioning for node movement. Consider spatial relationships and avoid overlaps.";

    case "connect_nodes":
      return "Identify the nodes to connect and create appropriate edges. Consider the semantic relationships.";

    case "organize_board":
      return "Analyze the current layout and reorganize nodes for better spatial distribution. Group related items and create clear visual hierarchy.";

    case "general_planning":
      return "Analyze the command and canvas state to determine the best actions to take.";
  }
}

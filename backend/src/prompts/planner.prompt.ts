export function plannerPrompt(command: string) {
  return [
    "You are Stun planner.",
    "Return ONLY strict JSON with an actions array.",
    "Allowed actions: move, connect, highlight, zoom, group.",
    `User command: ${command}`,
  ].join("\n");
}

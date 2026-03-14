import type { ReactFlowInstance } from "reactflow";

const instances = new Map<string, ReactFlowInstance>();
const waiters = new Map<string, Array<(instance: ReactFlowInstance) => void>>();

export function registerReactFlowInstance(
  boardId: string,
  instance: ReactFlowInstance
): void {
  instances.set(boardId, instance);
  const boardWaiters = waiters.get(boardId);
  if (boardWaiters && boardWaiters.length > 0) {
    for (const resolve of boardWaiters) {
      resolve(instance);
    }
    waiters.delete(boardId);
  }
}

export function unregisterReactFlowInstance(boardId: string): void {
  instances.delete(boardId);
}

export function getReactFlowInstance(
  boardId: string
): ReactFlowInstance | undefined {
  return instances.get(boardId);
}

export async function waitForReactFlowInstance(
  boardId: string,
  timeoutMs = 3000
): Promise<ReactFlowInstance> {
  const existing = instances.get(boardId);
  if (existing) return existing;

  return new Promise<ReactFlowInstance>((resolve, reject) => {
    const timeout = setTimeout(() => {
      const queue = waiters.get(boardId) ?? [];
      waiters.set(
        boardId,
        queue.filter((cb) => cb !== wrappedResolve)
      );
      reject(new Error(`Timed out waiting for ReactFlow instance for board ${boardId}`));
    }, timeoutMs);

    const wrappedResolve = (instance: ReactFlowInstance) => {
      clearTimeout(timeout);
      resolve(instance);
    };

    const queue = waiters.get(boardId) ?? [];
    queue.push(wrappedResolve);
    waiters.set(boardId, queue);
  });
}

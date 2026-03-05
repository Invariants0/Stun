import type { Request, Response } from "express";

export const healthController = {
  check(_req: Request, res: Response): void {
    res.json({ status: "ok", service: "stun-backend" });
  },
};

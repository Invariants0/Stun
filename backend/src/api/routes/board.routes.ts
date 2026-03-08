import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { boardUpdateRateLimiter } from "../middleware/ratelimit.middleware";
import { boardController } from "../controllers/board.controller";

export const boardRouter = Router();

// Board CRUD operations
boardRouter.post("/",requireAuth, boardController.create);
boardRouter.get("/",requireAuth, boardController.list);
boardRouter.get("/:id",requireAuth, boardController.getOne);
boardRouter.put("/:id",requireAuth,boardUpdateRateLimiter, boardController.update);
boardRouter.delete("/:id",requireAuth, boardController.delete);

// Board sharing & collaboration  
boardRouter.patch("/:id/visibility",requireAuth,boardUpdateRateLimiter, boardController.updateVisibility);
boardRouter.post("/:id/share",requireAuth,boardUpdateRateLimiter, boardController.addCollaborator);
boardRouter.delete("/:id/share/:userId",requireAuth,boardUpdateRateLimiter, boardController.removeCollaborator);
boardRouter.get("/:id/collaborators",requireAuth, boardController.getCollaborators);

import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware";
import { boardController } from "../controllers/board.controller";

export const boardRouter = Router();

boardRouter.post("/",requireAuth, boardController.create);
boardRouter.get("/",requireAuth, boardController.list);
boardRouter.get("/:id",requireAuth, boardController.getOne);
boardRouter.put("/:id",requireAuth, boardController.update);
boardRouter.patch("/:id/visibility",requireAuth, boardController.updateVisibility);
boardRouter.post("/:id/share",requireAuth, boardController.addCollaborator);
boardRouter.delete("/:id/share/:userId",requireAuth, boardController.removeCollaborator);
boardRouter.get("/:id/collaborators",requireAuth, boardController.getCollaborators);

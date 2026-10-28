
import { Router } from "express";
import {
  getCreateMessage,
  postCreateMessage,
} from "../controllers/messageController.js";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.js";

const messageRouter = Router();

messageRouter.get(
  "/create",
  ensureAuthenticated,
  getCreateMessage
);

messageRouter.post(
  "/create",
  ensureAuthenticated,
  postCreateMessage
);

export default messageRouter;

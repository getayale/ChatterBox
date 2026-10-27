
import { Router } from "express";
import type { Request, Response } from "express";
import { signinPost } from "../controllers/signinController.js";

const signinRouter = Router();

signinRouter.get("/", (req: Request, res: Response) => {
  res.render("login");
});

signinRouter.post("/", signinPost);

export default signinRouter;

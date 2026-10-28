
import { Router } from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.js";

const dashboardRouter = Router();

dashboardRouter.get("/", ensureAuthenticated, getDashboard);

export default dashboardRouter;

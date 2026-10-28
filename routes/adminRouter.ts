
import { Router } from "express";
import { ensureAdmin } from "../middleware/ensureAdmin.js";
import { getAdminDashboard } from "../controllers/adminController.js";
import {
  getAdminUsers,
  getCreateUser,
  postCreateUser,
  getEditUser,
  postEditUser,
  postDeleteUser,
} from "../controllers/adminUsersController.js";
import { getAdminMessages } from "../controllers/adminMessagesController.js";
import { postDeleteMessage } from "../controllers/adminMessagesController.js";

const adminRouter = Router();

// Admin dashboard
adminRouter.get("/", ensureAdmin, getAdminDashboard);

// View all users
adminRouter.get("/users", ensureAdmin, getAdminUsers);

// Create a user
adminRouter.get("/users/new", ensureAdmin, getCreateUser);
adminRouter.post("/users/new", ensureAdmin, postCreateUser);

// Edit a user
adminRouter.get("/users/:id/edit", ensureAdmin, getEditUser);
adminRouter.post("/users/:id/edit", ensureAdmin, postEditUser);

// Delete a user
adminRouter.post("/users/:id/delete", ensureAdmin, postDeleteUser);
adminRouter.get("/messages", ensureAdmin, getAdminMessages);
adminRouter.post(
  "/messages/:id/delete",
  ensureAdmin,
  postDeleteMessage
);

export default adminRouter;

import { Router } from "express";
import type { Request, Response } from "express";
import { ensureAuthenticated } from "../middleware/ensureAuthenticated.js";
import pool from "../db/pool.js";

const clubRouter = Router();

clubRouter.get(
  "/",
  ensureAuthenticated,
  (req: Request, res: Response) => {
    res.render("join-club", {
      error: null,
    });
  }
);

clubRouter.post(
  "/",
  ensureAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const { passcode } = req.body;

      if (
        typeof passcode !== "string" ||
        !process.env.CLUB_PASSCODE ||
        passcode !== process.env.CLUB_PASSCODE
      ) {
        return res.status(400).render("join-club", {
          error: "Incorrect passcode. Please try again.",
        });
      }

      if (!req.user) {
  return res.redirect("/login");
}

const userId = req.user.id;
      await pool.query(
        "UPDATE users SET is_member = TRUE WHERE id = $1",
        [userId]
      );

      res.redirect("/");
    } catch (error) {
      console.error("Error joining club:", error);
      res.status(500).send("Something went wrong. Please try again.");
    }
  }
);

export default clubRouter;

import type { Request, Response, NextFunction } from "express";
import pool from "../db/pool.js";

export const getCreateMessage = (
  req: Request,
  res: Response
) => {
  res.render("messages/create", {
    user: req.user,
    error: null,
  });
};

export const postCreateMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, text } = req.body;

    if (
      typeof title !== "string" ||
      typeof text !== "string" ||
      !title.trim() ||
      !text.trim()
    ) {
      return res.status(400).render("messages/create", {
        user: req.user,
        error: "Please enter both a title and a message.",
      });
    }

    await pool.query(
      `INSERT INTO messages (title, text, user_id)
       VALUES ($1, $2, $3)`,
      [title.trim(), text.trim(), req.user!.id]
    );

    res.redirect("/");
  } catch (error) {
    next(error);
  }
};

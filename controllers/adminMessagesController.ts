
import type { Request, Response, NextFunction } from "express";
import pool from "../db/pool.js";

export const getAdminMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pool.query(
      `SELECT
         messages.id,
         messages.title,
         messages.text,
         messages.created_at,
         users.first_name,
         users.last_name,
         users.email
       FROM messages
       JOIN users ON messages.user_id = users.id
       ORDER BY messages.created_at DESC`
    );

    res.render("admin/messages", {
      user: req.user,
      messages: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

export const postDeleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const rawId = req.params.id;

  if (typeof rawId !== "string" || !/^[1-9]\d*$/.test(rawId)) {
    return res.status(400).send("Invalid message ID.");
  }

  const id = Number(rawId);

  if (!Number.isSafeInteger(id)) {
    return res.status(400).send("Invalid message ID.");
  }

  try {
    const result = await pool.query(
      "DELETE FROM messages WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).send("Message not found.");
    }

    return res.redirect("/admin/messages");
  } catch (error) {
    next(error);
  }
};

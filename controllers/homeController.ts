
import type { Request, Response, NextFunction } from "express";
import pool from "../db/pool.js";

export const homePage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const isMember = req.user?.isMember === true;

    let messages: {
      title: string;
      text: string;
      first_name?: string;
      last_name?: string;
      created_at?: Date | string;
    }[];

    if (isMember) {
      const result = await pool.query(
        `SELECT
           messages.title,
           messages.text,
           users.first_name,
           users.last_name,
           messages.created_at
         FROM messages
         JOIN users ON messages.user_id = users.id
         ORDER BY messages.created_at DESC`
      );

      messages = result.rows;
    } else {
      const result = await pool.query(
        `SELECT title, text
         FROM messages
         ORDER BY created_at DESC`
      );

      messages = result.rows;
    }

    res.render("index", {
      user: req.user ?? null,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

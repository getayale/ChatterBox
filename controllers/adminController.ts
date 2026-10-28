
import type { Request, Response, NextFunction } from "express";
import pool from "../db/pool.js";

export const getAdminDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const [usersResult, messagesResult, membersResult] =
      await Promise.all([
        pool.query("SELECT COUNT(*) FROM users"),
        pool.query("SELECT COUNT(*) FROM messages"),
        pool.query(
          "SELECT COUNT(*) FROM users WHERE is_member = TRUE"
        ),
      ]);

    res.render("admin/dashboard", {
      user: req.user,
      totalUsers: Number(usersResult.rows[0].count),
      totalMessages: Number(messagesResult.rows[0].count),
      totalMembers: Number(membersResult.rows[0].count),
    });
  } catch (error) {
    next(error);
  }
};

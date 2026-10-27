
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import pool from "../db/pool.js";

export const signinPost = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("User with this email not found.");
    }

    const user = result.rows[0];

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).send("Incorrect password.");
    }

    res.send("Password verified successfully. Session login comes next.");
  } catch (error) {
    next(error);
  }
};

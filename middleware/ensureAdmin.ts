
import type { Request, Response, NextFunction } from "express";

export const ensureAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isAuthenticated()) {
    return res.redirect("/login");
  }

  if (!req.user?.isAdmin) {
    return res.status(403).send("Access denied. Admins only.");
  }

  next();
};

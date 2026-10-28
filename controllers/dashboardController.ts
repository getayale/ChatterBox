
import type { Request, Response } from "express";

export const getDashboard = (req: Request, res: Response) => {
  if (req.user?.isAdmin) {
    return res.redirect("/admin");
  }

  res.render("dashboard", {
    user: req.user ?? null,
  });
};

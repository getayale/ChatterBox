
import { Router } from "express";
import type { Request, Response } from "express";
import passport from "../config/passport.js";

const signinRouter = Router();

signinRouter.get("/", (req: Request, res: Response) => {
  res.render("login", { error: null });
});

signinRouter.post("/", (req: Request, res: Response, next) => {
  passport.authenticate(
    "local",
    (
      err: Error | null,
      user: Express.User | false,
      info: { message?: string }
    ) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res.status(401).render("login", {
          error: info?.message ?? "Unable to sign in.",
        });
      }

      req.logIn(user, (loginError) => {
        if (loginError) {
          return next(loginError);
        }

        if (user.isAdmin) {
          return res.redirect("/admin");
        }

        return res.redirect("/dashboard");
      });
    }
  )(req, res, next);
});

signinRouter.post("/logout", (req, res, next) => {
  req.logout((error) => {
    if (error) {
      return next(error);
    }

    req.session.destroy((sessionError) => {
      if (sessionError) {
        return next(sessionError);
      }

      res.clearCookie("connect.sid");
      return res.redirect("/");
    });
  });
});

export default signinRouter;

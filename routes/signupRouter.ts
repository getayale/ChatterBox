
import { Router } from "express";
import { body, validationResult } from "express-validator";
import { signupPost } from "../controllers/signupController.js";
import type { NextFunction, Request,Response } from "express";

const signupRouter = Router();

const validateSignup = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required.")
    .isLength({ max: 100 })
    .withMessage("First name must be at most 100 characters."),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required.")
    .isLength({ max: 100 })
    .withMessage("Last name must be at most 100 characters."),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required.")
    .isEmail()
    .withMessage("Enter a valid email address.")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long."),

  body("confirmPassword")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match.");
      }
      return true;
    }),
];

signupRouter.get("/", (req: Request, res: Response) => {
  res.render("signup", {
    errors: [],
    formData: {},
  });
});

signupRouter.post(
  "/",
  validateSignup,
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).render("signup", {
        errors: errors.array(),
        formData: {
          firstName: req.body.firstName,
          lastName: req.body.lastName,
          email: req.body.email,
        },
      });
    }

    signupPost(req, res, next);
  }
);

export default signupRouter;

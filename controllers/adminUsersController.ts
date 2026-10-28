
import type { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import pool from "../db/pool.js";

type UserFormData = {
  firstName: string;
  lastName: string;
  email: string;
};

type AdminAccount = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_member: boolean;
  is_admin: boolean;
};

const parseUserId = (
  value: string | string[] | undefined
): number | null => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);
  return Number.isSafeInteger(id) ? id : null;
};

const getFormData = (body: Request["body"]): UserFormData => ({
  firstName:
    typeof body.firstName === "string" ? body.firstName.trim() : "",
  lastName:
    typeof body.lastName === "string" ? body.lastName.trim() : "",
  email:
    typeof body.email === "string"
      ? body.email.trim().toLowerCase()
      : "",
});

const renderCreateUser = (
  res: Response,
  user: Express.User | undefined,
  error: string | null,
  formData: UserFormData = {
    firstName: "",
    lastName: "",
    email: "",
  },
  status = 200
) =>
  res.status(status).render("admin/create-user", {
    user,
    error,
    formData,
  });

const renderEditUser = (
  res: Response,
  user: Express.User | undefined,
  account: AdminAccount,
  error: string | null,
  status = 200
) =>
  res.status(status).render("admin/edit-user", {
    user,
    account,
    error,
  });

// GET /admin/users
export const getAdminUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await pool.query<AdminAccount>(
      `SELECT id, first_name, last_name, email, is_member, is_admin
       FROM users
       ORDER BY id ASC`
    );

    return res.render("admin/users", {
      user: req.user,
      users: result.rows,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /admin/users/new
export const getCreateUser = (
  req: Request,
  res: Response
) => {
  return renderCreateUser(res, req.user, null);
};

// POST /admin/users/new
export const postCreateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const formData = getFormData(req.body);
  const { password } = req.body;

  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    formData.firstName.length > 100 ||
    formData.lastName.length > 100 ||
    formData.email.length > 255 ||
    typeof password !== "string" ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    return renderCreateUser(
      res,
      req.user,
      "Enter valid details. Passwords must be 8–72 bytes.",
      formData,
      400
    );
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    await pool.query(
      `INSERT INTO users
         (first_name, last_name, email, password_hash)
       VALUES ($1, $2, $3, $4)`,
      [
        formData.firstName,
        formData.lastName,
        formData.email,
        passwordHash,
      ]
    );

    return res.redirect("/admin/users");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return renderCreateUser(
        res,
        req.user,
        "An account with this email already exists.",
        formData,
        400
      );
    }

    return next(error);
  }
};

// GET /admin/users/:id/edit
export const getEditUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseUserId(req.params.id);

  if (id === null) {
    return res.status(400).send("Invalid user ID.");
  }

  try {
    const result = await pool.query<AdminAccount>(
      `SELECT id, first_name, last_name, email, is_member, is_admin
       FROM users
       WHERE id = $1`,
      [id]
    );

    const account = result.rows.at(0);

    if (account === undefined) {
      return res.status(404).send("User not found.");
    }

    return renderEditUser(res, req.user, account, null);
  } catch (error) {
    return next(error);
  }
};

// POST /admin/users/:id/edit
export const postEditUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseUserId(req.params.id);

  if (id === null) {
    return res.status(400).send("Invalid user ID.");
  }

  const formData = getFormData(req.body);
  const { password } = req.body;

  const isMember =
    req.body.isMember === "on" || req.body.isMember === "true";

  const requestedIsAdmin =
    req.body.isAdmin === "on" || req.body.isAdmin === "true";

  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    formData.firstName.length > 100 ||
    formData.lastName.length > 100 ||
    formData.email.length > 255 ||
    (password !== undefined &&
      (typeof password !== "string" ||
        (password !== "" &&
          (password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72))))
  ) {
    return res.status(400).send(
      "Enter valid names and email. A new password must be 8–72 bytes."
    );
  }

  try {
    const existing = await pool.query<AdminAccount>(
      `SELECT id, first_name, last_name, email, is_member, is_admin
       FROM users
       WHERE id = $1`,
      [id]
    );

    const current = existing.rows.at(0);

    if (current === undefined) {
      return res.status(404).send("User not found.");
    }

    // Prevent an administrator from removing their own admin access.
    if (id === req.user?.id && !requestedIsAdmin) {
      return res.status(400).send(
        "You cannot remove your own administrator access."
      );
    }

    // Protect other administrator accounts from being edited here.
    if (id !== req.user?.id && current.is_admin) {
      return res.status(403).send(
        "Administrator accounts cannot be edited through this form."
      );
    }

    const updatedIsAdmin =
      id === req.user?.id ? current.is_admin : requestedIsAdmin;

    if (typeof password === "string" && password !== "") {
      const passwordHash = await bcrypt.hash(password, 10);

      await pool.query(
        `UPDATE users
         SET first_name = $1,
             last_name = $2,
             email = $3,
             is_member = $4,
             is_admin = $5,
             password_hash = $6
         WHERE id = $7`,
        [
          formData.firstName,
          formData.lastName,
          formData.email,
          isMember,
          updatedIsAdmin,
          passwordHash,
          id,
        ]
      );
    } else {
      await pool.query(
        `UPDATE users
         SET first_name = $1,
             last_name = $2,
             email = $3,
             is_member = $4,
             is_admin = $5
         WHERE id = $6`,
        [
          formData.firstName,
          formData.lastName,
          formData.email,
          isMember,
          updatedIsAdmin,
          id,
        ]
      );
    }

    return res.redirect("/admin/users");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23505"
    ) {
      return res.status(409).send(
        "That email address is already in use."
      );
    }

    return next(error);
  }
};

// POST /admin/users/:id/delete
export const postDeleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const id = parseUserId(req.params.id);

  if (id === null) {
    return res.status(400).send("Invalid user ID.");
  }

  if (id === req.user?.id) {
    return res.status(400).send(
      "You cannot delete your own account while logged in."
    );
  }

  try {
    const result = await pool.query(
      `DELETE FROM users
       WHERE id = $1
         AND is_admin = FALSE
       RETURNING id`,
      [id]
    );

    if (result.rows.length === 0) {
      const existing = await pool.query(
        "SELECT id FROM users WHERE id = $1",
        [id]
      );

      if (existing.rows.length === 0) {
        return res.status(404).send("User not found.");
      }

      return res.status(403).send(
        "Administrator accounts cannot be deleted through this page."
      );
    }

    return res.redirect("/admin/users");
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "23503"
    ) {
      return res.status(409).send(
        "This user has related records and cannot be deleted."
      );
    }

    return next(error);
  }
};

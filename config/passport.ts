
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import pool from "../db/pool.js";

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          `SELECT
             id,
             first_name,
             last_name,
             email,
             password_hash,
             is_member,
             is_admin
           FROM users
           WHERE email = $1`,
          [email]
        );

        if (result.rows.length === 0) {
          return done(null, false, {
            message: "User with this email not found.",
          });
        }

        const user = result.rows[0];

        const passwordMatches = await bcrypt.compare(
          password,
          user.password_hash
        );

        if (!passwordMatches) {
          return done(null, false, {
            message: "Incorrect password.",
          });
        }

        return done(null, {
          id: user.id,
          firstName: user.first_name,
          lastName: user.last_name,
          email: user.email,
          isMember: user.is_member,
          isAdmin: user.is_admin,
        });
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query(
      `SELECT
         id,
         first_name,
         last_name,
         email,
         is_member,
         is_admin
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return done(null, false);
    }

    const user = result.rows[0];

    done(null, {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      isMember: user.is_member,
      isAdmin: user.is_admin,
    });
  } catch (error) {
    done(error);
  }
});

export default passport;

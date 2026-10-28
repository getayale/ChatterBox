
import "dotenv/config";
import express from "express";
import path from "node:path";
import signupRouter from "./routes/signupRouter.js";
import signinRouter from "./routes/signinRouter.js";
import session from "express-session";
import passport from "./config/passport.js";
import clubRouter from "./routes/clubRouter.js";
import { homePage } from "./controllers/homeController.js";
import adminRouter from "./routes/adminRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import messageRouter from "./routes/messageRouter.js";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(process.cwd(), "public")));

app.use(
  session({
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
      maxAge: 1000 * 60 * 60 * 24,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", homePage);

app.use("/login", signinRouter);
app.use("/signup", signupRouter);
app.use("/join-club", clubRouter);
app.use("/admin",adminRouter);
app.use("/dashboard",dashboardRouter);
app.use("/admin", adminRouter);
app.use("/dashboard", dashboardRouter);
app.use("/messages", messageRouter);

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

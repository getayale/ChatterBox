import express from "express";
import path from "node:path";
import signupRouter from "./routes/signupRouter.js";
import signinRouter from "./routes/signinRouter.js";

const app=express();
const PORT=3000;
app.set("view engine", "ejs");

app.set("views", path.join(process.cwd(), "views"));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), "public")));

app.get("/", (req, res) => {
  res.send(`
    <h1>Members Only</h1>
    <p>Welcome to our exclusive clubhouse!</p>
    <a href="/login"><button>Login</button></a>
    <a href="/signup"><button>Sign Up</button></a>
  `);
});

app.use("/login", signinRouter);

app.use("/signup",signupRouter)

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});

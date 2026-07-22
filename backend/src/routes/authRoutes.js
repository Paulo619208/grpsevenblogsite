const express = require("express");
const { login, me, signup } = require("../controllers/authController");

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", me);

module.exports = authRouter;

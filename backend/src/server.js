const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const articleRouter = require("./routes/articleRoutes");
const authRouter = require("./routes/authRoutes");
const postRouter = require("./routes/postRoutes");

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/auth", authRouter);
app.use("/api/articles", articleRouter);
app.use("/api/posts", postRouter);

app.use((_request, response) => {
  response.status(404).json({
    error: "Route not found."
  });
});

app.listen(port, () => {
  console.log(`Backend server listening on port ${port}`);
});

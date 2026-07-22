const crypto = require("crypto");
const { getDataFilePath, readJson, writeJson } = require("../utils/storage");
const { createToken } = require("./authController");

const postsFilePath = getDataFilePath("posts.json");

function readPosts() {
  return readJson(postsFilePath, []);
}

function writePosts(posts) {
  writeJson(postsFilePath, posts);
}

function getPosts(_request, response) {
  const posts = readPosts().sort((first, second) => second.createdAt.localeCompare(first.createdAt));
  return response.json(posts);
}

function createPost(request, response) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return response.status(401).json({ error: "Authentication required to publish a post." });
  }

  const { title, content, excerpt, category } = request.body || {};

  if (!title || !content) {
    return response.status(400).json({ error: "Title and content are required." });
  }

  const usersFilePath = getDataFilePath("users.json");
  const users = readJson(usersFilePath, []);
  const user = users.find((candidate) => createToken(candidate) === token);

  if (!user) {
    return response.status(401).json({ error: "Invalid token." });
  }

  const posts = readPosts();
  const post = {
    id: crypto.randomUUID(),
    title: title.trim(),
    excerpt: excerpt?.trim() || content.trim().slice(0, 180),
    content: content.trim(),
    category: category?.trim() || "Community",
    authorName: user.name,
    authorId: user.id,
    createdAt: new Date().toISOString()
  };

  posts.push(post);
  writePosts(posts);

  return response.status(201).json(post);
}

module.exports = {
  getPosts,
  createPost
};

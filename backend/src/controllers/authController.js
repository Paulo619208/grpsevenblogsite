const crypto = require("crypto");
const { getDataFilePath, readJson, writeJson } = require("../utils/storage");

const usersFilePath = getDataFilePath("users.json");

function hashPassword(password, salt) {
  return crypto
    .createHash("sha256")
    .update(`${password}:${salt}`)
    .digest("hex");
}

function createToken(user) {
  return crypto
    .createHash("sha256")
    .update(`${user.id}:${user.email}:${user.createdAt}`)
    .digest("hex");
}

function readUsers() {
  return readJson(usersFilePath, []);
}

function writeUsers(users) {
  writeJson(usersFilePath, users);
}

function buildUserPublicProfile(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt
  };
}

function signup(request, response) {
  const { name, email, password } = request.body || {};

  if (!name || !email || !password) {
    return response.status(400).json({ error: "Name, email, and password are required." });
  }

  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const existingUser = users.find((candidate) => candidate.email === normalizedEmail);

  if (existingUser) {
    return response.status(409).json({ error: "An account with that email already exists." });
  }

  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = hashPassword(password, salt);
  const user = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    salt,
    createdAt: new Date().toISOString()
  };

  users.push(user);
  writeUsers(users);

  const token = createToken(user);

  return response.status(201).json({
    token,
    user: buildUserPublicProfile(user)
  });
}

function login(request, response) {
  const { email, password } = request.body || {};

  if (!email || !password) {
    return response.status(400).json({ error: "Email and password are required." });
  }

  const users = readUsers();
  const normalizedEmail = email.trim().toLowerCase();
  const user = users.find((candidate) => candidate.email === normalizedEmail);

  if (!user) {
    return response.status(401).json({ error: "Invalid email or password." });
  }

  const passwordHash = hashPassword(password, user.salt);
  if (passwordHash !== user.passwordHash) {
    return response.status(401).json({ error: "Invalid email or password." });
  }

  const token = createToken(user);

  return response.json({
    token,
    user: buildUserPublicProfile(user)
  });
}

function me(request, response) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return response.status(401).json({ error: "Authentication required." });
  }

  const users = readUsers();
  const user = users.find((candidate) => createToken(candidate) === token);

  if (!user) {
    return response.status(401).json({ error: "Invalid token." });
  }

  return response.json({ user: buildUserPublicProfile(user) });
}

module.exports = {
  signup,
  login,
  me,
  createToken
};

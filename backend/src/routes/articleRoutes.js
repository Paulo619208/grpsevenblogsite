const express = require("express");
const { getPaymentArticle } = require("../controllers/articleController");

const articleRouter = express.Router();

articleRouter.get("/payment-methods", getPaymentArticle);

module.exports = articleRouter;

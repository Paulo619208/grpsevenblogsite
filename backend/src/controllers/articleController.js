const paymentArticle = require("../data/blogArticle");

function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function getArticleWordCount(article) {
  const textParts = [
    article.title,
    article.subtitle,
    article.standfirst,
    article.highlightQuote,
    article.didYouKnow.title,
    article.didYouKnow.content,
    article.reflectionPrompt
  ];

  article.sections.forEach((section) => {
    textParts.push(section.heading, ...section.paragraphs);
  });

  return countWords(textParts.join(" "));
}

function getPaymentArticle(_request, response) {
  const enrichedArticle = {
    ...paymentArticle,
    wordCount: getArticleWordCount(paymentArticle)
  };

  if (enrichedArticle.wordCount < 700 || enrichedArticle.wordCount > 800) {
    return response.status(500).json({
      wordCount: enrichedArticle.wordCount,
      error:
        "Article content does not meet the required 700-800 word range. Update the content in backend/src/data/blogArticle.js."
    });
  }

  return response.json(enrichedArticle);
}

module.exports = {
  getPaymentArticle
};

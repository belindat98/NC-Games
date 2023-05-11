const express = require("express");
const { getCategories } = require("./controllers/categories.controllers");
const { getAPI } = require("./controllers/api.controllers");
const {
  getReviewById,
  getReviews,
  getCommentsByReviewId,
} = require("./controllers/reviews.controllers");
const { handleCustomErrors, handlePsqlErrors } = require("./errorHandlers");

const app = express();

app.get("/api/categories", getCategories);

app.get("/api", getAPI);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewById);

app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);

app.get("*", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = { app };

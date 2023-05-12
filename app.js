const express = require("express");
const { getCategories } = require("./controllers/categories.controllers");
const { getAPI } = require("./controllers/api.controllers");
const {
  getReviewById,
  getReviews,
  getCommentsByReviewId,
  patchReview,
  postComment,
} = require("./controllers/reviews.controllers");
const { handleCustomErrors, handlePsqlErrors } = require("./errorHandlers");
const { deleteComment } = require("./controllers/comments.controllers");

const app = express();

app.use(express.json());

app.get("/api/categories", getCategories);

app.get("/api", getAPI);

app.get("/api/reviews", getReviews);

app.get("/api/reviews/:review_id", getReviewById);
app.patch("/api/reviews/:review_id", patchReview);

app.get("/api/reviews/:review_id/comments", getCommentsByReviewId);
app.post("/api/reviews/:review_id/comments", postComment);

app.delete("/api/comments/:comment_id", deleteComment);

app.get("*", (req, res) => {
  res.status(404).send({ msg: "Not found" });
});

app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use((err, req, res, next) => {
  res.status(500).send({ msg: "Internal Server Error" });
});

module.exports = { app };

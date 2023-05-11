const {
  selectReviewById,
  selectReviews,
  selectCommentsByReviewId,
  updateReview,
  insertComment,
} = require("../models/reviews.models");

exports.getReviewById = (req, res, next) => {
  const review_id = req.params.review_id;
  selectReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch(next);
};

exports.getReviews = (req, res, next) => {
  selectReviews()
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch(next);
};

exports.getCommentsByReviewId = (req, res, next) => {
  const review_id = req.params.review_id;
  selectCommentsByReviewId(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch(next);
};

exports.patchReview = (req,res,next) => {
  const review_id = req.params.review_id;
  const {inc_votes} = req.body
  updateReview(review_id, inc_votes)
  .then(review => {
    res.status(201).send({review});
  })
  .catch(next)
}
exports.postComment = (req, res, next) => {
  const review_id = req.params.review_id;
  const { body, username } = req.body;
  insertComment(review_id, body, username)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch(next);
};

const { selectReviewById } = require("../models/reviews.models");

exports.getReviewById = (req, res, next) => {
  const review_id = req.params.review_id;
  selectReviewById(review_id)
    .then((review) => {
      console.log(review);
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

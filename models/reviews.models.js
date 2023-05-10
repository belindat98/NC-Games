const db = require("../db/connection");

exports.selectReviewById = (review_id) => {
  return db
    .query(`SELECT * FROM reviews WHERE review_id = $1`, [review_id])
    .then(({ rows }) => {
      const review = rows[0];
      if (!review) {
        return Promise.reject({ status: 404, msg: "review not found!" });
      }
      return review;
    });
};

exports.selectReviews = () => {
  return db
    .query(
      `SELECT 
      reviews.owner, 
      reviews.title, 
      reviews.review_id, 
      reviews.category, 
      reviews.review_img_url, 
      reviews.created_at, 
      reviews.votes, 
      reviews.designer, 
      COUNT(comment_id) AS comment_count 
      FROM reviews 
      LEFT JOIN comments ON reviews.review_id = comments.review_id 
      GROUP BY reviews.review_id
      ORDER BY reviews.created_at DESC;`
    )
    .then(({ rows }) => {
      return rows;
    });
};

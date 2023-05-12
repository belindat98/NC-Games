const db = require("../db/connection");
const { checkExists } = require("../utils/utils");

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

exports.selectReviews = (category, sort_by = "created_at", order = "DESC") => {
  const validSorts = [
    "owner",
    "title",
    "review_id",
    "category",
    "created_at",
    "votes",
    "designer",
  ];
  const validSortOrders = ["asc", "ASC", "desc", "DESC"];
  const queryValues = [];
  let queryStr = `SELECT 
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
      `;

  if (category) {
    queryStr += ` WHERE category LIKE $1`;
    queryValues.push(category);
  }

  if (!validSorts.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Invalid sort query" });
  }

  if (!validSortOrders.includes(order)) {
    return Promise.reject({ status: 400, msg: "Invalid sort order" });
  }

  queryStr += ` GROUP BY reviews.review_id
      ORDER BY reviews.${sort_by} ${order};
      `;
  return db.query(queryStr, queryValues)
  .then(({rows}) => {
    return rows;
  });
};

exports.selectCommentsByReviewId = (review_id) => {
  return Promise.all([
    db.query(
      `SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC;`,
      [review_id]
    ),
    checkExists("reviews", "review_id", review_id),
  ]).then(([commentsQueryOutput, unusedCheckExistsOutput]) => {
    const comments = commentsQueryOutput.rows;
    return comments;
  });
};

exports.updateReview = (review_id, inc_votes) => {
  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return db.query(
        `
    UPDATE reviews 
    SET 
    votes = votes + $1 
    WHERE review_id = $2 
    RETURNING*`,
        [inc_votes, review_id]
      );
    })
    .then(({ rows }) => rows[0]);
};

exports.insertComment = (review_id, body, username) => {
  return checkExists("reviews", "review_id", review_id)
    .then(() => {
      return db.query(
        `INSERT INTO comments
          (review_id, body, author)
          VALUES
          ($1, $2, $3)
          RETURNING*`,
        [review_id, body, username]
      );
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

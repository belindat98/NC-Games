const { removeComment } = require("../models/comments.models");

exports.deleteComment = (req, res, next) => {
  const comment_id = req.params.comment_id;
  removeComment(comment_id).then(() => {
    res.sendStatus(204);
  }).catch(next)
};

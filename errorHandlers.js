exports.handleCustomErrors = (err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else {
    next(err);
  }
};

exports.handlePsqlErrors = (err, req, res, next) => {

  if (err.code === "22P02") {
    res.status(400).send({ msg: "Invalid request!" });
  } 
  //foreign key violation
  if (err.code === "23503") {
    res.status(400).send({msg: `${err.detail}`})
  } 
  //not null violation
  if (err.code === "23502") {
    res.status(400).send({msg: "missing required key"})
  } else {
    next(err);
  }
};

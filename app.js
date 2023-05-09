const express = require("express");
const { getCategories } = require("./controllers/categories.controllers");

const app = express();

app.get("/api/categories", getCategories);

app.get("*", (req, res) => {
    res.status(404).send({msg: "Not found"})
})

module.exports = { app };

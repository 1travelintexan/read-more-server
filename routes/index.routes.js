const router = require("express").Router();
const BookModel = require("../models/Book.model");

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

router.post("/addbook", async (req, res) => {
  try {
    console.log("req.body for new book", req.body);
    const { bookName, bookAuthor, pages } = req.body;
    const newBookDB = await BookModel.create({ bookName, bookAuthor, pages });
    res.status(200).json({ newBook: newBookDB });
  } catch (err) {
    console.log("There was an error adding a book", err);
  }
});

module.exports = router;

const router = require("express").Router();
const BookModel = require("../models/Book.model");
const fileUploader = require("../config/cloudinary.config");
const User = require("../models/User.model");

router.get("/", async (req, res, next) => {
  res.status(200).json("all good here");
});

router.post("/addbook", async (req, res) => {
  console.log("req.body for new book", req.body);
  try {
    const { bookName, bookAuthor, pages } = req.body;
    const newBookDB = await BookModel.create({ bookName, bookAuthor, pages });
    res.status(200).json({ newBook: newBookDB });
  } catch (err) {
    console.log("There was an error adding a book", err);
  }
});

router.get("/book-list", async (req, res) => {
  console.log(req.session);
  try {
    const allBooks = await BookModel.find();
    res.status(200).json(allBooks);
  } catch (err) {
    console.log("There was an error adding a book", err);
  }
});

// POST route for saving a user image in the database
// This route has the image upload example
// fileUploader.single("userImage")
router.post("/upload", fileUploader.single("imageUrl"), (req, res) => {
  let userId = req.session.user._id;
  let newImage = req.file.path;
  console.log("the image is here!", req.file, userId);
  User.findByIdAndUpdate(userId, { imageUrl: newImage })
    .then((updatedUser) => {
      console.log("here is the Updated User", updatedUser);
      res.status(200).json(updatedUser);
    })
    .catch((error) =>
      console.log(`Error while creating a new movie: ${error}`)
    );
});

module.exports = router;

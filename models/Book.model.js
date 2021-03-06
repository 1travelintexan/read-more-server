const { model, Schema } = require("mongoose");

const bookSchema = new Schema({
  bookName: String,
  bookAuthor: String,
  pages: Number,
  image: String,
});

const BookModel = model("book", bookSchema);
module.exports = BookModel;

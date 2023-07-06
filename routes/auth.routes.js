const router = require("express").Router();
// ℹ️ Handles password encryption
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

// How many rounds should bcrypt run the salt (default [10 - 12 rounds])
const saltRounds = 10;

// Require the User model in order to interact with the database
const User = require("../models/User.model");

// Require necessary (isLoggedOut and isLiggedIn) middleware in order to control access to specific routes
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

router.post("/signup", isLoggedOut, (req, res) => {
  const { username, password, email } = req.body;
  console.log("signup body", req.body);
  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  }

  // if (password.length < 8) {
  //   return res.status(400).json({
  //     errorMessage: "Your password needs to be at least 8 characters long.",
  //   });
  // }

  //   ! This use case is using a regular expression to control for special characters and min length
  /*
  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}/;

  if (!regex.test(password)) {
    return res.status(400).json( {
      errorMessage:
        "Password needs to have at least 8 chars and must contain at least one number, one lowercase and one uppercase letter.",
    });
  }
  */

  // Search the database for a user with the username submitted in the form
  User.findOne({ username }).then((found) => {
    // If the user is found, send the message username is taken
    if (found) {
      return res.status(400).json({ errorMessage: "Username already taken." });
    }

    // if user is not found, create a new user - start with hashing the password
    return bcrypt
      .genSalt(saltRounds)
      .then((salt) => bcrypt.hash(password, salt))
      .then((hashedPassword) => {
        // Create a user and save it in the database
        return User.create({
          username,
          email,
          password: hashedPassword,
        });
      })
      .then((user) => {
        // Bind the user to the session object
        req.session.user = user;
        req.session.password = "****";
        res.status(201).json(user);
        console.log("User successfully signed up");
      })
      .catch((error) => {
        if (error instanceof mongoose.Error.ValidationError) {
          return res.status(400).json({ errorMessage: error.message });
        }
        if (error.code === 11000) {
          return res.status(400).json({
            errorMessage:
              "Username need to be unique. The username you chose is already in use.",
          });
        }
        return res.status(500).json({ errorMessage: error.message });
      });
  });
});

router.post("/login", isLoggedOut, (req, res, next) => {
  const { username, password } = req.body;

  if (!username) {
    return res
      .status(400)
      .json({ errorMessage: "Please provide your username." });
  }

  // Here we use the same logic as above
  // - either length based parameters or we check the strength of a password
  // if (password.length < 8) {
  //   return res.status(400).json({
  //     errorMessage: "Your password needs to be at least 8 characters long.",
  //   });
  // }

  // Search the database for a user with the username submitted in the form
  User.findOne({ username })
    .then((user) => {
      // If the user isn't found, send the message that user provided wrong credentials
      if (!user) {
        return res.status(400).json({ errorMessage: "Wrong credentials." });
      }

      // If user is found based on the username, check if the in putted password matches the one saved in the database
      bcrypt.compare(password, user.password).then((isSamePassword) => {
        if (!isSamePassword) {
          return res.status(400).json({ errorMessage: "Wrong credentials." });
        }
        user.password = "****";
        req.session.user = user;
        console.log("User just logged in successfully");
        // req.session.user = user._id; // ! better and safer but in this case we saving the entire user object
        return res.json(user);
      });
    })

    .catch((err) => {
      // in this case we are sending the error handling to the error handling middleware that is defined in the error handling file
      // you can just as easily run the res.status that is commented out below
      next(err);
      // return res.status(500).render("login", { errorMessage: err.message });
    });
});

router.post("/logout", isLoggedIn, (req, res) => {
  console.log("made it here to logout", req.session);
  req.session.destroy();
  // Nothing to send back to the user
  res.status(204).json({});
});

//update user route
router.post("/update", async (req, res) => {
  let userId = req.session.user._id;
  console.log("here is the update body", req.body);
  if (req.body.password !== "") {
    let newPassword = req.body.password;
    let newHash = bcrypt.hash(newPassword);
    await User.findByIdAndUpdate(userId, { password: newHash });
  }
  if (req.body.username !== "") {
    await User.findByIdAndUpdate(userId, { username: req.body.username });
  }
  if (req.body.email !== "") {
    await User.findByIdAndUpdate(userId, { email: req.body.email });
  }
  let updatedUser = await User.findById(userId);
  console.log("Updated User", updatedUser);
  res.status(200).json(updatedUser);
});

// THIS IS A PROTECTED ROUTE
// will handle all get requests to http:localhost:5005/api/user
router.get("/user", async (req, res, next) => {
  if (req.session.user) {
    let userId = req.session.user._id;
    let profileUser = await User.findById(userId);
    console.log("for the profile", profileUser);
    res.status(200).json(profileUser);
  } else {
    res.status(201).json("Please login in");
  }
});

module.exports = router;

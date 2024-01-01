const express = require("express");
const router = express.Router();
const fileUpload = require("express-fileupload");
const Post = require("../models/Post");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post(
  "/post/publish",
  isAuthenticated,
  fileUpload(),
  async (req, res) => {
    try {
      //   console.log(req.headers.authorization);
      const newPost = await new Post({
        owner: req.user,
        message: req.body.message,
        video: req.body.video,
        likers: [],
        comments: [],
        dateOfPost: new Date(),
      });
      await newPost.save();
      //   console.log(newPost);
      res.json(newPost);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

module.exports = router;

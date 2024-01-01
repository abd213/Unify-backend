require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const app = express();
app.use(express.json());

mongoose.connect("mongodb://localhost/social-network");

const userRoutes = require("./routes/user");
const postRoutes = require("./routes/post");
app.use(userRoutes);
app.use(postRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ error: "Cette route n'existe pas" });
});

app.listen(3003, () => {
  console.log("Server has started !");
});

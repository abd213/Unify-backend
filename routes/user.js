const express = require("express");
const router = express.Router();
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    console.log(req.body);
    const { username, email, password, newsletter, birthDate, team, bio } =
      req.body;
    if (username) {
      const user = await User.findOne({ email: email });
      if (!user) {
        const token = uid2(64);
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        console.log(hash);
        const newUser = new User({
          email: email,
          account: {
            username: username,
          },
          team: team,
          birthDate: birthDate,
          bio: bio,
          newsletter: newsletter,
          token: token,
          salt: salt,
          hash: hash,
        });
        await newUser.save();
        res.json({
          _id: newUser._id,
          token: newUser.token,
          account: newUser.account,
          team: newUser.team,
          birthDate: newUser.birthDate,
        });
      } else {
        res.status(409).json({ error: "Email already used" });
      }
    } else {
      res.status(400).json({ error: "Username is required" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
      const newHash = SHA256(password + user.salt).toString(encBase64);
      if (newHash === user.hash) {
        res.status(201).json({
          _id: user._id,
          token: user.token,
          account: user.account,
          team: user.team,
          birthDate: user.birthDate,
        });
      } else {
        res.status(401).json({ error: "Unauthorized" });
      }
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      const user = await User.findById(id);
      if (user) {
        res.status(200).json({ user });
      } else {
        res.status(400).json({ error: "ID unknown" });
      }
    } else {
      res.status(400).json({ error: "Missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/api/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { username, email, password, newsletter, birthDate, team, bio } =
      req.body;
    if (id) {
      const userToUpdate = await User.findById(id);
      if (userToUpdate) {
        if (username) {
          userToUpdate.username = username;
        }
        if (newsletter) {
          userToUpdate.newsletter = newsletter;
        }
        if (birthDate) {
          userToUpdate.birthDate = birthDate;
        }
        if (team) {
          userToUpdate.team = team;
        }
        if (bio) {
          userToUpdate.bio = bio;
        }
        await userToUpdate.save();
        res.status(200).json({ userToUpdate });
      } else {
        res.status(400).json({ error: "ID unknown" });
      }
    } else {
      res.status(400).json({ error: "Missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/api/user/:id", async (req, res) => {
  try {
    const id = req.params.id;
    if (id) {
      const userToDelete = await User.findById(id);
      if (userToDelete) {
        await userToDelete.deleteOne();
        res.status(200).json({ message: "user successfully deleted" });
      } else {
        res.status(200).json({ message: "ID unknown" });
      }
    } else {
      res.status(200).json({ message: "missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/user/follow/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { idToFollow } = req.body;
    if (id || idToFollow) {
      const user = await User.findById(id);
      const userToFollow = await User.findById(idToFollow);
      //Si le user est trouvé alors on rajoute à la liste des abonnenement
      if (user && userToFollow) {
        const user = await User.findByIdAndUpdate(
          id,
          { $addToSet: { following: idToFollow } },
          { new: true, upsert: true }
        );

        // Il faut aussi rajouter l'abonnés à la personne suivi
        const userToFollow = await User.findByIdAndUpdate(
          req.body.idToFollow,
          { $addToSet: { followers: id } },
          { new: true, upsert: true }
        );
        res.status(201).json(user);
      } else {
        res.status(400).json({ message: "ID unknown" });
      }
    } else {
      res.status(400).json({ message: "missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.patch("/user/unfollow/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const { idToUnfollow } = req.body;
    if (id || idToUnfollow) {
      const user = await User.findById(id);
      const userToUnfollow = await User.findById(idToUnfollow);
      //Si le user est trouvé alors on rajoute à la liste des abonnenement
      if (user && userToUnfollow) {
        const user = await User.findByIdAndUpdate(
          id,
          { $pull: { following: idToUnfollow } },
          { new: true, upsert: true }
        );

        // Il faut aussi rajouter l'abonnés à la personne suivi
        const userToUnfollow = await User.findByIdAndUpdate(
          req.body.idToUnfollow,
          { $pull: { followers: id } },
          { new: true, upsert: true }
        );
        res.status(201).json(user);
      } else {
        res.status(400).json({ message: "ID unknown" });
      }
    } else {
      res.status(400).json({ message: "missing parameter" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;

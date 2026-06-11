const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const authMiddleware = require("../middleware/authMiddleware");

const prisma = require("../prisma");

const router = express.Router();

router.get(
  "/profile",
  authMiddleware,
  async (req, res) => {

    try {

      const user =
        await prisma.user.findUnique({
          where: {
            id: req.user.id
          }
        });

      res.json({
        id: user.id,
        username: user.username,
        email: user.email
      });

    } catch (error) {

      res.status(500).json({
        message: "Server Error"
      });

    }
  }
);



router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser =
      await prisma.user.findUnique({
        where: {
          email
        }
      });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const hashedPassword =
      await bcrypt.hash(password, 10);

    const user =
      await prisma.user.create({
        data: {
          username,
          email,
          password: hashedPassword
        }
      });

    res.status(201).json({
      message: "User registered",
      userId: user.id
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

router.post("/login", async (req, res) => {
  try {

    const { email, password } = req.body;

    const user =
      await prisma.user.findUnique({
        where: {
          email
        }
      });

    if (!user) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const validPassword =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!validPassword) {
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );
    res.json({
      token,
      username: user.username,
      userId: user.id
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Server Error"
    });
  }
});

module.exports = router;
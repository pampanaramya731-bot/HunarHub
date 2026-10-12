require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("./models/User");
const Product = require("./models/Product");
const Entrepreneur = require("./models/Entrepreneur");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const {
  authenticate,
  requireRole
} = require("./middleware/auth");

const app = express();
app.use(helmet());

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many attempts. Please try again later."
  }
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:5173"
}));
app.use(express.json({ limit: "20kb" }));

const clean = (value) =>
  typeof value === "string" ? value.trim() : "";

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function createToken(user) {
  return jwt.sign(
    { id: user._id.toString() },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
}

function publicUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

app.get("/", (req, res) => {
  res.json({ message: "HunarHub backend is running!" });
});

// REGISTER
app.post("/api/auth/register", async (req, res) => {
  try {
    const name = clean(req.body.name);
    const email = clean(req.body.email).toLowerCase();
    const password = req.body.password;
    const role = req.body.role || "customer";

    if (name.length < 2 || name.length > 80) {
      return res.status(400).json({
        message: "Name must contain 2–80 characters."
      });
    }

    if (!validEmail(email) || email.length > 254) {
      return res.status(400).json({
        message: "Enter a valid email address."
      });
    }

    if (
      typeof password !== "string" ||
      password.length < 8 ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Password must contain 8–72 characters."
      });
    }

    if (!["customer", "entrepreneur"].includes(role)) {
      return res.status(400).json({
        message: "Invalid account role."
      });
    }

    const existing = await User.findOne({ email });

    if (existing) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    const token = createToken(user);

    return res.status(201).json({
      message: "Account created successfully.",
      token,
      user: publicUser(user)
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists."
      });
    }

    console.error("Registration error:", error.message);
    return res.status(500).json({
      message: "Could not create account."
    });
  }
});

// LOGIN
app.post("/api/auth/login", async (req, res) => {
  try {
    const email = clean(req.body.email).toLowerCase();
    const password = req.body.password;

    if (
      !validEmail(email) ||
      typeof password !== "string" ||
      password.length > 72
    ) {
      return res.status(400).json({
        message: "Enter a valid email and password."
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (
      !user ||
      !(await bcrypt.compare(password, user.password))
    ) {
      return res.status(401).json({
        message: "Incorrect email or password."
      });
    }

    return res.json({
      message: "Login successful.",
      token: createToken(user),
      user: publicUser(user)
    });
  } catch (error) {
    console.error("Login error:", error.message);
    return res.status(500).json({
      message: "Could not log in."
    });
  }
});

// CHECK CURRENT USER
app.get("/api/auth/me", authenticate, (req, res) => {
  res.json({ user: publicUser(req.user) });
});

// LIST PRODUCTS
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Could not load products."
    });
  }
});

// CREATE PRODUCT — LOGIN REQUIRED
app.post(
  "/api/products",
  authenticate,
  requireRole("entrepreneur"),
  async (req, res) => {
    try {
      const name = clean(req.body.name);
      const description = clean(req.body.description);
      const category = clean(req.body.category) || "Handmade";
      const price = req.body.price;

      if (name.length < 2 || name.length > 120) {
        return res.status(400).json({
          message: "Product name must contain 2–120 characters."
        });
      }

      if (
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 100000000
      ) {
        return res.status(400).json({
          message: "Enter a valid product price."
        });
      }

      if (description.length > 1000 || category.length > 80) {
        return res.status(400).json({
          message: "Description or category is too long."
        });
      }

      const product = await Product.create({
        name,
        description,
        price,
        category,
        createdBy: req.user._id
      });

      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({
        message: "Could not create product."
      });
    }
  }
);

// LIST ENTREPRENEUR PROFILES
app.get("/api/entrepreneurs", async (req, res) => {
  try {
    const profiles = await Entrepreneur.find()
      .sort({ createdAt: -1 })
      .limit(200)
      .populate("user", "name");

    res.json(profiles);
  } catch (error) {
    res.status(500).json({
      message: "Could not load entrepreneur profiles."
    });
  }
});

// SUBMIT OR UPDATE OWN PROFILE
app.post(
  "/api/entrepreneurs",
  authenticate,
  requireRole("entrepreneur"),
  async (req, res) => {
    try {
      const name = clean(req.body.name);
      const craft = clean(req.body.craft);
      const location = clean(req.body.location);
      const description = clean(req.body.description);
      const phone = clean(req.body.phone);

      if (
        name.length < 2 || name.length > 80 ||
        craft.length < 2 || craft.length > 80 ||
        location.length < 2 || location.length > 120 ||
        description.length < 10 || description.length > 1000 ||
        phone.length > 20
      ) {
        return res.status(400).json({
          message: "Please check all profile fields and try again."
        });
      }

      const profile = await Entrepreneur.findOneAndUpdate(
        { user: req.user._id },
        {
          user: req.user._id,
          name,
          craft,
          location,
          description,
          phone
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
      );

      res.status(200).json({
        message: "Entrepreneur profile saved.",
        profile
      });
    } catch (error) {
      console.error("Profile error:", error.message);
      res.status(400).json({
        message: "Could not save your profile."
      });
    }
  }
);

// GET MY OWN PROFILE
app.get(
  "/api/entrepreneurs/me",
  authenticate,
  requireRole("entrepreneur"),
  async (req, res) => {
    try {
      const profile = await Entrepreneur.findOne({
        user: req.user._id
      });

      res.json({ profile });
    } catch {
      res.status(500).json({
        message: "Could not load your profile."
      });
    }
  }
);

// Avoid leaking internal error details
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);
  res.status(500).json({ message: "Unexpected server error." });
});

async function startServer() {
  if (!process.env.MONGO_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGO_URI and JWT_SECRET must be set in .env");
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log("MongoDB connected successfully!");

  app.listen(PORT, () => {
    console.log(`HunarHub backend running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server startup failed:", error.message);
  process.exit(1);
});
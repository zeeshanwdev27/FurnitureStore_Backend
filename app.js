import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import Product from "./models/Product.js";
import User from "./models/User.js";
import connectDB from "./lib/dbConnect.js";
import cors from "cors";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());
connectDB(); // Connect to MongoDB

// JWT Authentication Middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

// Routes
app.get('/', (req, res) => res.send('Hello World!'));

// Product Routes
app.get('/api/products', async (req, res) => {
  try {
    const data = await Product.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.get("/api/all-products", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all products" });
  }
});

app.get("/api/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/product/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

app.get("/api/search", async (req, res) => {
  const query = req.query.query;
  if (!query) return res.json({ products: [] });

  try {
    const products = await Product.find({
      name: { $regex: query, $options: "i" },
    }).limit(10);
    res.json({ products });
  } catch (err) {
    res.status(500).json({ error: "Search failed" });
  }
});

// Auth Routes
app.post('/api/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check existing user
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? "Email already in use" 
          : "Username already taken"
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = new User({ 
      email, 
      username, 
      password: hashedPassword 
    });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: "User created and logged in",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username
      },
      token
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({ 
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      },
      token
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

// Protected Route Example
app.get('/api/protected', authenticate, (req, res) => {
  res.json({ message: "This is protected data", userId: req.userId });
});

// Start Server
app.listen(port, () => console.log(`Server running on port ${port}`));
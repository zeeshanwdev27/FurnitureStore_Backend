import dotenv from 'dotenv';
dotenv.config();

import express from "express"
import Product from "./models/Product.js"
import User from "./models/User.js";
import connectDB from "./lib/dbConnect.js"
import cors from "cors"

const app = express()
const port = 3000
app.use(cors())
app.use(express.json())
connectDB(); // Connect to MongoDB




//routes
app.get('/', (req, res) => res.send('Hello World!'))

// Feature Products
app.get('/api/products', async (req, res) => {
    try {
      const data = await Product.find();
      res.json(data); // Send the product data as JSON
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

//Display All Products
app.get("/api/all-products",async(req,res)=>{
  try{
  const products = await Product.find()
  res.json(products)
  }catch(err){
    res.status(500).json({error : "Failed to Fetch all-products"})
  }
})

//Categories
app.get("/api/category/:category", async (req, res) => {
  try {
    const category = req.params.category;
    const products = await Product.find({ category });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});


// Specific Product by ID
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

//Search
app.get("/api/search", async (req, res) => {
  const query = req.query.query;
  // console.log(query);
  
  if (!query) return res.json({ products: [] });

  const products = await Product.find({
    name: { $regex: query, $options: "i" },
  }).limit(10);

  res.json({ products });
});



// User Signup
app.post('/api/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body;

    // Basic validation
    if (!email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email 
          ? "Email already in use" 
          : "Username already taken"
      });
    }

    // Create new user
    const newUser = new User({ email, username, password });
    await newUser.save();

    // Return success response (without password)
    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        createdAt: newUser.createdAt
      }
    });

  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Server error during signup" });
  }
});

// User Login
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Login successful (in a real app, you'd generate a token here)
    res.json({ 
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        username: user.username
      }
    });

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))
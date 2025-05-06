import dotenv from 'dotenv';
dotenv.config();

import express from "express"
import Product from "./models/Product.js"
import connectDB from "./lib/dbConnect.js"
import cors from "cors"

const app = express()
const port = 3000
app.use(cors())
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
  console.log(query);
  
  if (!query) return res.json({ products: [] });

  const products = await Product.find({
    name: { $regex: query, $options: "i" },
  }).limit(10);

  res.json({ products });
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
import mongoose from "mongoose";
const schema = mongoose.Schema


const productSchema = new schema({
    name: { type: String, required: true },
    description: String,
    price: { type: Number, required: true },
    image: {
      url: String,
      filename: String
    },
    category: String
  });


const Product = mongoose.model("Product", productSchema)


export default Product
import mongoose from "mongoose";
import Product from "../models/Product.js"
import sampledata from './dummydata.js'


const mongo_url = "mongodb://127.0.0.1:27017/Eccomapp"
dbConnect()  
.then(() => console.log("Database is Connected"))
.catch((err) => console.log(err));

async function dbConnect (){
    await mongoose.connect(mongo_url)
}

const sampleData = async()=>{
    await Product.insertMany(sampledata.data)
    .then(()=>console.log("Dummy Data Inserted Successfully"))
    .catch((err)=>console.log("Error in Inserting Data into DB",err))
}

sampleData()
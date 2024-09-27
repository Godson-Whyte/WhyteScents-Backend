require('dotenv').config();
const PORT = process.env.PORT || 4001
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer")
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

//Database Connection with MongoDB
mongoose.connect(process.env.mongoDbUrl)

//API Creation
app.get('/',(req,res)=>{
    res.send('Express App is Running')
})

//Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename:(req,file,cb)=>{
        return cb(null,`${file.fieldname}_${Date.now()}${path.extreme(file.originalname)}`)
    }
})

const upload = multer({storage:storage})

//Creating upload endpoint for images
app.use('/images',express.static('upload/images'))

// app.post("/upload", upload.single('product'), (req,res) =>{
//     res.json({
//         success:1,
//         image_url:`http://localhost:${PORT}/images/${req.file.filename}`
//     })
// })
app.post("/upload", upload.single('product'), (req, res) => {
    if (req.file) {
        res.json({
            success: 1,
            image_url: `http://localhost:${PORT}/images/${req.file.filename}`
        });
    } else {
        res.status(400).json({
            success: 0,
            message: "No file uploaded or file upload failed"
        });
    }
});

//Schema for Creating Products
const Product = mongoose.model("Product",{
    id:{
        type: Number,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        // required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true
    },
})

app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0){
        let last_product_array = products.slice(-1)
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
    const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
    });
    console.log(product);
    await product.save();
    console.log("Saved");
    res.json({
        success:true,
        name:req.body.name,
    })
    
})

//Creating API for deleting Products

app.post('/removeproduct', async (req,res) => {
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Remouved");
    res.json({
        success:true,
        name:req.body.name
    })
    
})

//Creating API for get all products
app.get('/allproducts', async (req,res) =>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

app.listen(PORT,(error)=>{
    if (!error) {
        console.log(`Server Running on Port: ${PORT}`);
    }
    else{
        console.log(`Error: ${error}`);
        
    }
})
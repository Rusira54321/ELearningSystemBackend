const express = require("express")
require("dotenv").config()
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json())
const userRouter = require("./router/UserRouter")
const PORT = process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)   
})
const mongoDBURL = process.env.mongodbURL
mongoose.connect(mongoDBURL).then(()=>{
    console.log("Connected to MongoDB")
}).catch((err)=>{
    console.error("Error connecting to MongoDB:", err)
})
app.use("/api/user",userRouter)
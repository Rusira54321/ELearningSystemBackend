const user = require("./model/User")
const bcrypt = require("bcrypt")
const express = require("express")
require("dotenv").config()
const mongoose = require("mongoose")
const cors = require("cors")
const app = express()
app.use(cors())
app.use(express.json())
const userRouter = require("./router/UserRouter")
const PORT = process.env.PORT || 8000
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
const addAdmin = async () =>{
    const existadmin = await user.findOne({role:"Admin"})
    if(existadmin){
        console.log("Admin already exists")
        return
    }
    const admin = new user({
        FullName:"rusira Dinujaya",
        email:"rusira42103@gmail.com",
        password:await bcrypt.hash("rusira134567", 10),
        role:"Admin"
    })
    await admin.save().then((res)=>{
        console.log("Admin created successfully")
    })
}
addAdmin()
const bcrypt = require("bcrypt")
const jsonwebtoken = require("jsonwebtoken")
const user = require("../model/User")
const registerUser = async(req,res) =>{
    const profileImage = req.file ? req.file.filename : ""
    const {fullname,email,password,role,phoneNumber,address} = req.body
    if(!fullname || !email || !password || !role){
        return res.status(400).json({message:"Please fill all the required fields"})
    }
    const existingUser = await user.findOne({email:email})
    if(existingUser){
        return res.status(400).json({message:"User already exists"})
    }
    const hashedPassword = await bcrypt.hash(password,10)
    const newUser = new user({
        FullName: fullname,
        email: email,
        password: hashedPassword,
        role: role,
        phoneNumber: phoneNumber,
        profilePicture: profileImage,
        address: address
    })
    try{
        const savedUser = await newUser.save()
        const token = jsonwebtoken.sign({id:savedUser._id,role:savedUser.role},process.env.JWT_SECRET,{expiresIn:"1d"})
        return res.status(201).json({
            message:"User registered successfully",
            role: savedUser.role,
            token: token
        })
    }catch(error){
        console.error("Error creating user:", error)
        return res.status(500).json({message:"Internal server error"})
    }

}
module.exports = {registerUser}
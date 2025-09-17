const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const user = require("../model/User")
require('dotenv').config()

const loginUserService = async({email,password}) =>{
    const existUser = await user.findOne({email});
    if(!existUser) throw new Error("User not found !");

    const isPasswordValid = await bcrypt.compare(password, existUser.password);
    if(!isPasswordValid) throw new Error("Invalid Password !");

    //JWT
    const token = jwt.sign(
        {id: existUser._id, role: existUser.role},
        process.env.JWT_SECRET,
        {expiresIn: "1d"}
    );

    return{
        message:"Succesfully logged in",
        role: existUser.role,
        token,
    };
};

module.exports = {loginUserService}









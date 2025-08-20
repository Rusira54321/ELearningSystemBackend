const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    FullName:{
        type:String,
        required:true,
        trim:true,
        minlength:3,
        maxlength:50,
        match:[/^[a-zA-Z ]+$/, "Name can only contain letters and spaces"]
    },
    email:{
        type:String,
        required:true,
        unique:true,
        match:[/^\S+@\S+\.\S+$/, "Please enter a valid email address"]
    },
    password:{
        type:String,
        required:true,
        minlength:8
    },
    role:{
        type:String,
        enum:["Student","Teacher","Admin"],
        default:"Student",
        required:true
    },
    phoneNumber:{
        type:String,
        match:[/^\+?\d{10,15}$/, "Please enter a valid phone number"]
    },
    profilePicture:{
        type:String,
        default:""
    },
    address:{
        type:String,
        maxlength:200
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
})
module.exports = mongoose.model("User", userSchema)
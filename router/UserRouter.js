const express = require("express")
const router = express.Router()
const {registerUser} = require("../controller/Usercontroller")
const {upload} =require("../Middleware/Multer")
const { loginUser } = require("../controller/LoginController")

//registration
router.post("/register",upload.single("profilePicture"),registerUser)

//login
router.post("/login", loginUser)

module.exports = router
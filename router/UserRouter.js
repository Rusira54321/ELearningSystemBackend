const express = require("express")
const router = express.Router()
const {registerUser} = require("../controller/Usercontroller")
const {upload} =require("../Middleware/Multer")
const { loginUser } = require("../controller/LoginController")
const {checkToken} = require("../controller/tokenCheckingController")
//registration
router.post("/register",upload.single("profilePicture"),registerUser)

//login
router.post("/login", loginUser)

//check token is validate 
router.post("/checktoken",checkToken)

module.exports = router
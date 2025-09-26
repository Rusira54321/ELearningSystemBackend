const router = require("express").Router()
const {verifyStudentTokens} = require("../controller/StudentController")
router.post("/verifyStudentToken",verifyStudentTokens)
module.exports = router
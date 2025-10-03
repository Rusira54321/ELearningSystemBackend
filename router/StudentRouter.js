const router = require("express").Router()
const {verifyStudentTokens} = require("../controller/StudentController")
const {authorizedStudent} = require("../Middleware/Student")
const {getAllCourses} = require("../controller/CourseController")
router.post("/verifyStudentToken",verifyStudentTokens)
router.get("/getAllCourses",authorizedStudent,getAllCourses)
module.exports = router
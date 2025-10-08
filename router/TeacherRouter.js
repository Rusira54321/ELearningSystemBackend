const router = require("express").Router()
const {createCourse} = require("../Middleware/Course")
const {mutipleFileupload} = require("../Middleware/MulipleFileUploader")
const {getTeacherIdByToken,getCourseEnrolledStudents,createQuize,addAnnouncements} = require("../controller/TeacherController")
router.post("/getteacherid",getTeacherIdByToken)
router.post("/getEnrolledStudents",createCourse,getCourseEnrolledStudents)
router.post("/createQuiz",createCourse,createQuize)
router.post("/createAnnouncement",createCourse,mutipleFileupload.fields( [{ name: "videos", maxCount: 20 },{ name: "pdfs", maxCount: 20 },{ name: "others", maxCount: 20 }]),addAnnouncements)
module.exports = router
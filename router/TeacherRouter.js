const router = require("express").Router()
const {createCourse} = require("../Middleware/Course")
const {mutipleFileupload} = require("../Middleware/MulipleFileUploader")
const {getTeacherIdByToken,getCourseEnrolledStudents,createQuize,addAnnouncements
    ,getNumberOFTotalStudents,countNumberOfCoursesByTeacherId
,countNumberOfQuizesByTeacherId,getAllQuizesByTeacherId
,getQuizById,getquizResultByQuizId,deleteQuizes,deleteStudentByEmail} = require("../controller/TeacherController")
router.post("/getteacherid",getTeacherIdByToken)
router.post("/getEnrolledStudents",createCourse,getCourseEnrolledStudents)
router.post("/createQuiz",createCourse,createQuize)
router.post("/createAnnouncement",createCourse,mutipleFileupload.fields( [{ name: "videos", maxCount: 20 },{ name: "pdfs", maxCount: 20 },{ name: "others", maxCount: 20 }]),addAnnouncements)
router.post("/totalNumberOfStudents",createCourse,getNumberOFTotalStudents)
router.get("/countNumberOfCourses/:teacherId",createCourse,countNumberOfCoursesByTeacherId)
router.get("/countNumberOfQuizes/:teacherId",createCourse,countNumberOfQuizesByTeacherId)
router.get("/getAllQuizesByTeacher/:teacherId",createCourse,getAllQuizesByTeacherId)
router.get("/getQuizById/:quizId",createCourse,getQuizById)
router.get("/getQuizResult/:quizId",createCourse,getquizResultByQuizId)
router.delete("/deleteQuiz/:quizId",createCourse,deleteQuizes)
router.post("/deleteStudents",createCourse,deleteStudentByEmail)
router.dele
module.exports = router
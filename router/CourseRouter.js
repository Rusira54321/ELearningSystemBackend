const express = require("express")
const router = express.Router()
const {createCourses,viewCourses,addLesson,uploadMaterials, deleteCourse, editCourse} = require("../controller/CourseController")
const {upload} = require("../Middleware/Multer")
const {mutipleFileupload} = require("../Middleware/MulipleFileUploader")
const {createCourse} = require("../Middleware/Course")

router.post("/create",createCourse,upload.single("coursePicture"),createCourses)
router.post("/lesson/add/:courseId",createCourse,addLesson)
router.post("/materials/upload/:courseId/:lessonId",createCourse,mutipleFileupload.fields( { name: "videos", maxCount: 20 },{ name: "pdfs", maxCount: 20 },{ name: "others", maxCount: 20 }),uploadMaterials)
router.get("/all",viewCourses)
router.delete("/delete/:id",deleteCourse)

module.exports = router
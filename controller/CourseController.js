const Course = require("../model/Course");
const user = require("../model/User")

const createCourses = async(req,res) =>{
    try{
    const image = req.file.filename
    const {title,description,teacher,payorFree,category,price} = req.body
    if(!image)
    {
        return res.status(500).json({message:"internal server error"})
    }
    if(!title || !description || !teacher || !payorFree || !category)
    {
        return res.status(400).json({message:"All fields are missing"});
    }
    const course = new Course({
        title,
        description,
        teacher,
        payorFree,
        lessons:[],
        lessonPicture:image,
        Category:category,
        price
    })
    await course.save()
    return res.status(201).json({message:"Course created successfully"})
}catch(err)
{
    return res.status(500).json({message:"Internal server error"})
}
}

const viewCourses = async(req,res) =>{
    try{
        const courses = await Course.find()
        res.json(courses);
    }catch(err){
        return res.status(404).json({message:"Course not found"})
    }
}

const deleteCourse = async(req,res)=>{
    try{
        const {id} = req.params;
        const delCourse = await Course.findByIdAndDelete(id)
        
        if(!delCourse){
            res.status(404).json({message:"Course not found"});
        }
        res.status(201).json({message:"Course deleted succesfully"});
    }catch(err){
        res.status(500).json({message:"Internal server error"});
    }
}

const uploadMaterials = async(req,res) =>{
    try{
    const {courseId} = req.params
    const {title,description} = req.body
    if(!title || !description)
    {
        return res.status(400).json({message:"Fields are required"})
    }
    if(!req.files || Object.keys(req.files).length==0)
    {
        return res.status(400).json({message:"No files uploaded"})
    }
    const course = await Course.findById(courseId)
    if(!course)
    {
        return res.status(404).json({message:"Course not found"})
    }
    const lessons = {
        title,
        description,
        videos:[],
        pdfs:[],
        otherMaterials:[]
    }
    if(req.files.videos && Array.isArray(req.files.videos))
    {
        req.files.videos.forEach((file)=>{
            lessons.videos.push({title:file.originalname,videoUrl:file.filename})
        })
    }
    if(req.files.pdfs && Array.isArray(req.files.pdfs))
    {
        req.files.pdfs.forEach((file)=>{
            lessons.pdfs.push({title:file.originalname,videoUrl:file.filename})   
        })
    }
    if(req.files.others && Array.isArray(req.files.others))
    {
        req.files.others.forEach((file)=>{
            lessons.otherMaterials.push({fileUrl:file.filename})
        })
    }
    course.lessons.push(lessons)
    await course.save()
    return res.status(200).json({message:"Files uploaded"})
}catch(err)
{
    return res.status(500).json({message:err})
}
}

const getAllCourses = async (req, res) => {
  try {
    const allCourses = await Course.find();

    // Use Promise.all to wait for all async operations
    const courses = await Promise.all(
      allCourses.map(async (course) => {
        const teacherDetails = await user.findById(course.teacher);
        const teacherName = teacherDetails?.FullName || "Unknown";

        return {
          ...course.toObject(), // convert Mongoose document to plain object
          teacherName,
        };
      })
    );

    return res.status(200).json({ courses });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
};

const getCourseById = async(req,res) =>{
    try{
        const {id} = req.params
        if(!id)
        {
            return res.status(400).json({message:"request has an error"})
        }
        const course = await Course.findById(id).populate("teacher","FullName")
        if(!course)
        {
            return res.status(404).json({message:"Course not found"})
        }
        return res.status(200).json({course})
    }catch(err)
    {
        return res.status(500).json(err.message)
    }
} 
const getEnrolledCourse = async (req, res) => {
    const { userid } = req.params;

    try {
        const User = await user.findById(userid);
        if (!User) {
            return res.status(404).json({ message: "User not found" });
        }

        const enrolledCoursesIds = User.enrolledCourses.map(ec => ec.courseID);

        // Fetch all courses in parallel
        const courses = await Promise.all(
            enrolledCoursesIds.map(id => Course.findById(id))
        );

        return res.status(200).json({ courses });
    } catch (error) {
        return res.status(500).json({ error });
    }
};


module.exports = {createCourses,uploadMaterials,getAllCourses,viewCourses,deleteCourse,getCourseById,getEnrolledCourse}
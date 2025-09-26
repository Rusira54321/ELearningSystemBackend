const Course = require("../model/Course");
const user = require("../model/User")
const createCourses = async(req,res) =>{
    try{
    const image = req.file.filename
    const {title,description,teacher,payorFree} = req.body
    if(!image)
    {
        return res.status(500).json({message:"internal server error"})
    }
    if(!title || !description || !teacher || !payorFree)
    {
        return res.status(400).json({message:"All fields are missing"});
    }
    const course = new Course({
        title,
        description,
        teacher,
        payorFree,
        lessons:[],
        lessonPicture:image
    })
    await course.save()
    return res.status(201).json({message:"Course created successfully"})
}catch(err)
{
    return res.status(500).json({message:"Internal server error"})
}
}

const addLesson = async(req,res) =>{
    try{
    const {courseId} = req.params
    const {title,description} = req.body
    if(!title)
    {
        return res.status(400).json({message:"title is required"})
    }
    const course = await Course.findById(courseId)
    if(!course)
    {
        return res.status(404).json({message:"Course not found"})
    }
    const newLesson = {
        title,
        description,
        videos:[],
        pdfs:[],
        otherMaterials:[]
    }
    course.lessons.push(newLesson)
    await course.save()
    return res.status(200).json({message:"Lesson added successfully"})
    }catch(err)
    {
        return res.status(500).json({message:"Internal server error",Error:err})
    }
}   

const uploadMaterials = async(req,res) =>{
    try{
    const {courseId,lessonID} = req.params
    if(!req.files || Object.keys(req.files).length==0)
    {
        return res.status(400).json({message:"No files uploaded"})
    }
    const course = await Course.findById(courseId)
    if(!course)
    {
        return res.status(404).json({message:"Course not found"})
    }
    const lesson = course.lessons.id(lessonID)
    if(!lesson)
    {
        return res.status(404).json({message:"Lesson not found"})
    }
    if(req.files.videos && Array.isArray(req.files.videos))
    {
        req.files.videos.foreach((file)=>{
            lesson.videos.push({title:file.originalname,videoUrl:file.filename})
        })
    }
    if(req.files.pdfs && Array.isArray(req.files.pdfs))
    {
        req.files.pdfs.foreach((file)=>{
            lesson.pdfs.push({title:file.originalname,videoUrl:file.filename})   
        })
    }
    if(req.files.others && Array.isArray(req.files.others))
    {
        req.files.others.foreach((file)=>{
            lesson.otherMaterials.push({fileUrl:file.filename})
        })
    }
    await course.save()
    return res.status(200).json({message:"Files uploaded"})
}catch(err)
{
    return res.status(500).json({message:err.message})
}
}


module.exports = {createCourses,addLesson,uploadMaterials}
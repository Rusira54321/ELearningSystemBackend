const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
    },
    videos:[
        {
            title:{
                type:String
            },
            videoUrl:{
                type:String,
                required:true
            }
        },
    ],
    pdfs:[
        {
            title:{
                type:String
            },
            videoUrl:{
                type:String,
                required:true
            }
        },
    ],
    
    otherMaterials:[
        {
            fileUrl:{
                type:String
            },
        },
    ],
    
});
const StudentSchema = new mongoose.Schema({
    StudentID:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    }
})
const courseSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        trim:true,
    },
    description:{
        type:String,
        required:true
    },
    teacher:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },

    lessons:[lessonSchema],
    
    payorFree:{
        type:String,
        enum:["Paid","Free"],
        required:true
    },
    lessonPicture:{
        type:String,
        required:true
    },
    Category:{
        type:String,
        enum:["Technology & IT","Business & Management","Personal Development","Creative Arts & Design","Science & Engineering","Language & Communication","Health & Fitness","Life Skills & Lifestyle","Exams & Certification Prep","Others / Emerging Topics"],
        required:true
    },
    price:{
        type:Number,
    },
    enrollStudents:[StudentSchema]
}
,
{
    timestamps:true,strict:false
})

module.exports = mongoose.model("Course",courseSchema);
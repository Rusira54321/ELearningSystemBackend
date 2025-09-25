const e = require("express");
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
}
,
{
    timestamps:true,strict:false
})

module.exports = mongoose.model("Course",courseSchema);
const mongoose = require("mongoose")
const AnnouncementSchema = new mongoose.Schema({
    CourseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Course",
        required:true
    },
    teacherId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    title:{
        type:String,
        required:true
    },
    Description:{
        type:String,
        required:true
    },
    OtherMaterials:[
        {
            Url:{
                type:String,
            }
        }
    ],
    createdAt:{
        type:Date,
        default:Date.now
    }
})
module.exports = mongoose.model("Announcement",AnnouncementSchema)
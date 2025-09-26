const jwt = require("jsonwebtoken")
const user = require("../model/User")
require("dotenv").config()
const secretkey = process.env.JWT_SECRET
const verifyStudentTokens = (req,res) =>{
    const authHeader = req.header("Authorization")
            if(!authHeader)
            {
                return res.status(401).json({message:"Unauthorized:missing token"})
            }
            const [bearer,token] = authHeader.split(" ")
            if(bearer!=="Bearer" || !token)
            {
                return res.status(401).json({message:"unauthorized:Invalid token format"})
            }
            jwt.verify(token,secretkey,(err,payload)=>{
                if(err)
                {
                    return res.status(401).json({message:"Forbidden: Invalid token"})
                }
                const id = payload.id
                const finduser = async() =>{
                      const matcheduser =   await user.findById(id)
                      if(matcheduser.role=="Teacher" || matcheduser.role=="Admin")
                      {
                            return res.status(403).json({message:"You are not Student"})
                      }
                      return res.status(200).json({message:"User is valid",userid:id})
                }
                finduser()
            })
}

module.exports = {verifyStudentTokens}
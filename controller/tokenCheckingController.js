/*This function checks if the token is valid or not and returns appropriate response when logged in user 
is try in to access the website again after close the browser and by this function user cannot reloging ehen loading to another tab to the website*/
require("dotenv").config()
const secretkey = process.env.JWT_SECRET
const jwt = require("jsonwebtoken")
const checkToken = (req,res) =>{
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
                    return res.status(200).json({message:"Token is valid"})
                })
}
module.exports = {checkToken}
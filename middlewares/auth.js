const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('../models/User');

//auth
exports.auth = async (req,res,next) => {
    try {
        // extract the token
        const token = req.body.token || req.cookie.token || req.header("Authorisation").replace("Bearer ","");
    
        // Check whether token found
        if(!token){
            return res.status(401).json({
                success : false,
                message : "Token not Found",
            });
        }
    
        // If token found then verify
        try {
            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.body = decode;
        } 
        catch (error) {
            // verification failed
            return res.status(401).json({
                success : false,
                message : "verification failed",
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : "Something Went Wrong  failed",
        });
    }   
}


//isStudent
// Role access kar sakta hu mai kyuki req ki body me decode value daali hai and token bananne ke liye payload me role add ki thi hence req me se bhi role access kar sakte hai
exports.isStudent = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Student") {
            return res.status(500).json({
                success : false,
                message : "This is a protected route for Students only"
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : "Something Went Wrong  failed",
        });
    }
}

//isInstructor
exports.isInstructor = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Instructor") {
            return res.status(500).json({
                success : false,
                message : "This is a protected route for Instructor only"
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : "Something Went Wrong  failed",
        });
    }
}

//isAdmin
exports.isAdmin = async (req,res,next) => {
    try {
        if(req.user.accountType !== "Admin") {
            return res.status(500).json({
                success : false,
                message : "This is a protected route for Admin only"
            });
        }
        next();
    } catch (error) {
        return res.status(401).json({
            success : false,
            message : "Something Went Wrong  failed",
        });
    }
}
const User = require('../models/User')
const OTP = require('../models/Otp');
const otpGenerator = require('otp-generator')
const bcrypt = require('bcrypt');
const Profile = require('../models/Profile');
const jwt = require('jsonwebtoken')
//sendOTP

exports.sendOTP = async (req,res) => {

    try {
        //fetch email from request body
        const {email} = req.body;

        //check if user already exists
        const checkUser = await User.findOne({email});

        if(checkUser){
            return res.status(401).json({
                success: false,
                message: "User already Exists",
            })
        }

        // generate otp 
        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets : false,
            lowerCaseAlphabets : false,
            specialChars : false
        });
        console.log("OTP generated ",otp);

        let result = await OTP.findOne({otp: otp});

        while(result){
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets : false,
                lowerCaseAlphabets : false,
                specialChars : false
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email,otp};

        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody);

        // return success
        res.status(200).json({
            success : true,
            message : "OTP send successfully",
            otp
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message: "An Error Occured",
        })
    }

}

//signup

exports.signUp = async (req,res) => {
    try {
        //data fetch 
        const {firstName,lastName,email,password,confirmPassword,accountType,contactNumber,otp} = req.body;

        // data validate 
        if(!firstName || !lastName || !email || !password || !confirmPassword || !otp){
            return res.status(403).json({
                success : false,
                message : "Cannot Validate the Data || All fields are required",
            })
        }

        // passw validate
        if(password !== confirmPassword){
            return res.status(400).json({
                success : false,
                message : "Password and Confirm Password doesn't matched, Try Again",
            })
        }

        // check user already exists
        const existingUser = await User.findOne({email})
        if(existingUser){
            return res.status(401).json({
                success : false,
                message : "User already registered"
            });
        }

        // find most recent otp stored for the user
        const recentOtp = await OTP.findOne({email}).sort({createdAt:-1}).limit(1);

        // validate the otp
        if(recentOtp.length == 0){
            // OTP not found
            return res.status(400).json({
                success : false,
                message : "OTP Not found",
            });
        } else if(otp!==recentOtp.otp){
            // Invalid 
            return res.status(400).json({
                success : false,
                message : "OTP invalid",
            });
        }

        // HAsh pass

        const hashPassword = await bcrypt.hash(password,10);

        const profileDetails = await Profile.create({
            gender : null,
            dateOfBirth : null,
            about : null,
            contactNumber : null
        })
        // entry creeate in db
        const user = await User.create({
            firstName,
            lastName,
            email,
            password,
            contactNumber,
            accountType,
            additionalDetails : profileDetails._id,
            image : `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`
        })

        // return res
        return res.status(200).json({
            success : true,
            message : "User Registration Completed Successfully",
            user
        })
    } catch (error) {
        console.log("An Error occured while Sign-Up");
        return res.status(400).json({
            success : false,
            message : "Cannot Be Done"
        })
    }
    
}
//Login

exports.login = async (req, res) => { 
    try {
        const {email, password} = req.body;

        if(!email || !password) {
            return res.status(403).json({
                success : false,
                message : "Fill Details correctly",
            })
        }
        // Check user exists or not 
        const user = await User.findOne({email}).populate("additionalDetails"); // NOt necessary to populate
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User is not Registered",
            })
        }

        // Check password matches 
        if(await bcrypt.compare(password, user.password)){
            const payload = {
                email : user.email,
                id : user._id,
                accountType : user.accountType,
            }
            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn :"2h",
            })
            user.token = token;
            user.password = undefined;
            // create cookie

            const options = {
                expires : new Date(Date.now() + 3*24*60*60*1000),
                httpOnly : true,
            }
            res.cookie("token", token, options).status(200).json({
                success : true,
                token,
                user,
                message : "Logged In Successfully",
            })
        } 
        else {
            return res.status(401).json({
                success : false,
                message : "Password Incorrect"
            })
        }
    } catch (error) {
        console.log(error);
        return res.status(400).json({
            success : false,
            message : "Login Failure, Please Try again Later"
        })
    }
}
//ChangePassword
exports.changePassword  = async (req, res) => {
    // get data from body
    //get old , new , confirm new password
    //validation

    // update pwd in DB
    // send mail - Pwd changed successfully,
}



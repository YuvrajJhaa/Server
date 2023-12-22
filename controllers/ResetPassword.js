const User = require('../models/User');
const mailSender = require('../utils/mailSender');
const bcrypt = require('bcrypt')


// resetpassword token

exports.resetPasswordToken = async (req,res) => { 
    try {
        // get the email from user
        const email = req.body.email;

        // find the user from this email
        const user = await User.findOne({email: email});
        // verify the user
        if(!user){
            return res.status(401).json({
                success : false,
                message : "User is not Registered",
            });
        }

        // generate the different token
        const token = crypto.randomUUID();
        
        // Update the details by adding it into the user
        const updatedDetails = await User.findOneAndUpdate({email: email}, 
                                                            {
                                                                token : token,
                                                                resetPasswordExpires : Date.now() + 5*60*1000,
                                                            },
                                                            {new:true}); // Gives the updatedDetails
        // Create the Dynamic URL
        const url = `https://localhost:3000/update-password/${token}`;
        // send mail
        await mailSender(email,"Password Reset Link", `Password Reset Link : ${url}`);

        // return res
        return res.json({
            success :true,
            message : "Reset Password Link has been sent to your Email ID ",
        });


    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : true,
            message : "Cannot send the Reset Password Link"
        })
    }


}

// resetpassword
exports.resetPassword = async (req,res) => {
    try {
        // data fetch password and confirm password  (new which is considered for reset)from the user
        const {password, confirmPassword,token} = req.body;
        // validation
        if(password !== confirmPassword) {
            return res.json({
                success : false,
                message : "Password doesn't match with the Confirm password",
            })
        }
        // get userdetails from db
        const userDetails = await User.findOne({token : token});
        // if no entry found - invalid
        if(!userDetails){
            return res.status(401).json({
                success : false,
                message : "No User found"
            })
        }
        // token time expires
        if(userDetails.resetPasswordExpires < Date.now()){
            return res.status(401).json({
                success : false,
                message : "Reset Password Link Expired (yikes)"
            })
        }
        // pwd hash
        const hashedPassword = await bcrypt.hash(password, 10);

        // update pwd
        await User.findOneAndUpdate({token: token},
                                    {password: hashedPassword},
                                    {new: true});
        // return response
        return res.status(200).json({
            success : true,
            message : "Password Reset Successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Something Went Wrong while sending reset password email"
        })
    }
    
}

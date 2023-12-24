const Profile = require('../models/Profile')
const User = require('../models/User')

exports.updateProfile = async (req,res)=> {
    try {
        // data fetch
        const {dateOfBirth="", about="",gender, contactNumber } = req.body;
        const id = req.user.id;
        // validation
        if(!contactNumber || !gender) {
            return res.status(400).json({
                success :false,
                message : "All fields are required",
            });
        }
        // find profile
            // 1. we got user id from that snatch the userDetails
            const userDetails = await User.findById(id);
            // 2. from User details fetch the profileId
            const profileId = await userDetails.additionalDetails;
            // 3. from profileId fetch the profile details and make the respective updates
            const profileDetails = await Profile.findById(profileId);

        // update profile
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.gender = gender;
        profileDetails.contactNumber = contactNumber;
        // Profile object is already created in User schema no need to create another one hence just the save() the changes accordingly 
        await profileDetails.save();
        // return response 

        return res.status(200).json({
            success : true,
            message : "Profile Details Updated successfully",
            profileDetails,
        });

    } catch (error) {
        console.log(error);
        return res.status(200).json({
            success : false,
            message : "Profile Details not Updated, Something Went Wrong",
          
        });
    }
}

// delete account

exports.deleteAccount = async (req,res) => {
    try {
        //get id
        const id = req.user.id;
        // validation
        // find userDetails got from request then check validation
        const userDetails = await findById(id);
        if(!userDetails) {
            return res.status(404).json({
                success :false,
                message : "User Not present to be deleted, yikes",
            });
        }
        // delete profile
        await Profile.findByIdAndDelete({_id: userDetails.additionalDetails});
        //user delete
        await User.findByIdAndDelete({_id:id});
        // return response
        return res.status(200).json({
            success : true,
            message : "User Account Deleted Successfully",
          
        });
    } catch (error) {
        console.log(error);
        return res.status(200).json({
            success : false,
            message : "cannot Delete Account, Something Went Wrong",
          
        });
    }
}

// GetAllUserDetails

exports.getAllUserDetails = async (req,res) => {
    try {
        // get user id
        const id = req.user.id;
        // get userDetails
        const userDetails = await User.findById(id).populate("additionaDetails").exec();
        // return response
        return res.status(200).json({
            success : true,
            message : "User Data fetched Successfully",
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "User Data Not Fetched, Somthing Went Wrong",
        })
    }
}
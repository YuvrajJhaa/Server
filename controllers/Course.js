const User = require('../models/User')
const Tag = require('../models/Tags')
const Course = require('../models/Course')
const {uploadImageToCloudinary} = require('../utils/imageUploader')

// create course handler function 
exports.createCourse = async(req,res) => {
    try {
        const {courseName, courseDescription, whatYouWillLearn, price, tag} = req.body;
        // fetch the thumbnail

        const thumbnail = req.files.thumbnailImage;

        // validation 
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag || !thumbnail) {
            return res.status(400).json({
                success : false,
                message : "All fields are required",
            });
        }

        // check for instructor
        const userId = req.user.id;
        const instructorDetails = await User.findOne({userId})
        console.log("Instructor Details", instructorDetails);
        if(!instructorDetails) {
            return res.status(400).json({
                success : false,
                message : "Instructor details not found",
            });
        }

        // check for tag
        const tagDetails = await Tag.findById(tag);
        if(!tagDetails) {
            return res.status(400).json({
                success : false,
                message : "Tag details not found",
            });
        }

        // upload image to cloudinary
        const thumbnailImage = await uploadImageToCloudinary(thumbnail, process.env.FOLDER_NAME);

        // create entry for course in db
        const newCourse = await Course.create({
            courseName,
            courseDescription,
            instructorDetails : instructorDetails._id,
            whatYouWillLearn,
            price,
            tag:tagDetails._id,
            thumbnail:thumbnail.secure_url,
        });

        // add new course to user schema in instructor
        await User.findOneAndUpdate(
            {id : instructorDetails._id},
            {
                $push : {
                    courses : newCourse._id,
                }
            },
            {new : true}
        );

        // update TAG schema

        // return response
        return res.status(200).json({
            success : true,
            message : "Course Created Successfully",
            data : newCourse
        })
    } catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error while Course Creation",
        })
    }

}

// getall courses;

exports.showAllCourses = async (req,res) => {
    try {
        const allCourses = await Course.find({}, {
        courseName : true,
        price : true,
        thumbnail :true,
        instructor : true,
        ratingAndReviews : true,
        studentsEnrolled : true,
        }).populate("instructor").exec();

        return res.status(200).json({
            success : true,
            message : "Courses fetched Successfully",
            data : newCourse
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success : false,
            message : "Cannot fetch all courses",
        })
    }
}
const Section = require('../models/Section')
const Course = require('../models/Course')

exports.createSection = async (req, res) => {
    try {
        // data fetch

        const {sectionName, courseId} = req.body;
        // validation
        if(!sectionName || !courseId) {
            return res.status(401).json({
                success : false,
                message : "All fields are required to be filled",
            })      
        }

        // create a section in db
        const newSection = await Section.create({sectionName});

        // update the course details
        const updatedCourseDetails = await Course.findByIdAndUpdate(courseId, 
                                                                {
                                                                    $push: {
                                                                        courseContent : newSection._id
                                                                    }
                                                                },
                                                                {new:true}                                                              
                                                            ).populate("Section").exec(); // HW tha badal bhi sakte hai
        
        return res.status(200).json({
            success : true,
            message : "Section Created Successfully",
            updatedCourseDetails
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Section Created Not Created , Something Went Wrong",
        });
    }
}

// update Sections

exports.updateSection = async (req,res) => {
   try {
    // data input  
    const {sectionName, sectionId} = req.body;

    // data validation
    if(!sectionName || !sectionId) {
        return res.status(401).json({
            success : false,
            message : "All field are required",
        });
    }

    // update the sections
    const section = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true} );
    // return response
    return res.status(200).json({
        success : true,
        message : "Section Updated Successfully",
        updatedCourseDetails
    });
   } 
   catch (error) {
    console.log(error);
    return res.status(500).json({
        success : false,
        message : "Section Not updated , Something Went Wrong",
    });
    }   
}

// delete section
exports.deleteSection = async(req,res) => {
    try {
        // get ID
        const {sectionId} = req.params;
        // use findByIdAndDelete
        await findByIdAndDelete(sectionId);
        // return res
        return res.status(200).json({
            success : true,
            message : "Section Deleted Successfully"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success : false,
            message : "Section not deleted , Something Went Wrong",
        });
    }
}
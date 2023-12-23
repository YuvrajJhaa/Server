const SubSection = require('../models/SubSection');
const Section = require('../models/SubSection');
const { uploadImageToCloudinary } = require('../utils/imageUploader');
require('dotenv')


exports.createSubSection = async(req,res) => {
   try {
     // sectionID , title, timeDuration, description, videoUrl

     const {sectionId,title,timeDuration, description} = req.body;
     // extract the video
     const video = req.files.videoFile;
     //validation
     if(!sectionId, !title, !timeDuration, !description, !video) {
         return res.status(400).json({
             success : false,
             message : "All fields are Required",
         });
     }
 
     // upload videoFile to cloudinary
     const uploadDetails = await uploadImageToCloudinary(video, process.env.FOLDER_NAME);

     // add entry
     const SubSectionDetails = await SubSection.create({
        title : title,
        timeDuration : timeDuration,
        description : description,
        videoUrl : uploadDetails.secure_url,
     });

     // update this section with section object id
     const updatedSection = await Section.findByIdAndUpdate(sectionId,
                                                            {
                                                                $push : {
                                                                    subSection : SubSectionDetails._id,
                                                                }
                                                            },
                                                            {new : true}
                                                            );
     
     // return res
     return res.status(200).json({
        success : true,
        message : "SubSection Updated Successfully",
        updatedSection
    });
   } catch (error) {
    console.log(error);
    return res.status(500).json({
        success : false,
        message : "Internal Server Error",
    });
   }
    
}
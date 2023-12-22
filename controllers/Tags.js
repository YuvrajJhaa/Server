const Tag = require('../models/Tags')

exports.createTag = async (req,res) => {
    try {
        // Fetch data -> check tag model
        const {name, description} = req.body;

        // validate 
        if(!user || !description){
            return res.status(401).json({
                success : false,
                message : "User name and description not Mentioned properly"
            });
        }

        // create an entry in db
        const tagDetails = await Tag.create({
            name : name,
            description : description
        });

        return res.status(200).json({
            success : true,
            message : "Tag Created Successfully",
        });
    } 
    catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error while Creating an Tag"
        });
    }
}
// Find All tags 

exports.showAlltags = async (req,res) => {
    try {
        const allTags = await Tag.find({}, {name : true, description : true});
        return res.status(500).json({
            success : true,
            message : "Tags Retrieved Successfully"
        });
    } 
    catch (error) {
        return res.status(500).json({
            success : false,
            message : "Error while Creating an Tag"
        });
    }
}
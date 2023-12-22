const mongoose = require('mongoose')
require("dotenv").config();

exports.connect = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser:true,
        useUnifiedTopology : true,
    })
    .then(()=>{console.log("Database Connected Successfully")})
    .catch((error) =>{
        console.error(error);
        console.log("Error while connecting to DB");
        process.exit(1);
    })
};
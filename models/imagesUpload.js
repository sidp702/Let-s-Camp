var mongoose = require("mongoose");

var imageUploadSchema = new mongoose.Schema({
    image1:String,
    image1Id:String,

    image2:String,
    image2Id:String,

    image3:String,
    image3Id:String,

    image4:String,
    image4Id:String,

    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" 
        },
        username: String
    }

});

module.exports = mongoose.model("Image",imageUploadSchema);
    
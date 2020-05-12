var mongoose = require("mongoose");
var Campgrounds = require("./models/campground"); 
var Comment = require("./models/comment");  
var data = [
    {
        name: "Cloud Rest",
        image: "https://img.traveltriangle.com/blog/wp-content/uploads/2017/10/camping-in-nainital-cover.jpg",
        description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature."

    } ,
    {
        name: "Dry grounds",
        image: "https://www.easemytrip.com/travel/img/ladakh-camping.jpg",
        description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature."
        
    }, 
    {
        name: "Lake Laky",
        image: "https://r-cf.bstatic.com/images/hotel/max1024x768/170/170409317.jpg",
        description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature."
        
    }
]
function seedDB(){
    Campgrounds.deleteMany({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed Campgrounds");
        data.forEach(function(seed){
            Campgrounds.create(seed,function(err,campground){
                if(err){
                    console.log(err)
                } else {
                    console.log("added a campground");
                    // create a comment for the campground
                    Comment.create({
                        text: "This place is greate but i wish there was internet",
                        author: "Bobby"
                    },function(err,comment){
                        if(err){
                            console.log(err);
                        }else {
                            campground.comments.push(comment)
                            campground.save();
                            console.log("Created a new comment");
                        }
    
                      
                    });
                
                }
            });
        });
    }); 

    
}

module.exports = seedDB;

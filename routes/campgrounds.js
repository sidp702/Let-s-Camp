var ocdkey      = process.env.OCD_API_KEY;
var express = require("express");
var router  = express.Router();
var Campgrounds = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = require("../middleware");
var Images = require("../models/imagesUpload");
var bodyParser     =  require("body-parser");
var fs = require('fs');
var dir = './uploads';
var path = require('path');
var datauri = require('datauri');

//  datauri = req => datauri().format(path.extname(req.file.originalname).toString(), req.file.buffer);

router.use(bodyParser.json()).use(bodyParser.urlencoded({extended: true}))
router.use(bodyParser.json());

var NodeGeocoder = require('node-geocoder');
var options = {
  provider: 'opencage',
  httpAdapter: 'https',
  apiKey:  ocdkey,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);





const upload  = require("../middleware/multer")
// const dataUri = require("..middleware/multer"); 
var cloudinary = require('cloudinary');
cloudinary.config({ 
  cloud_name: 'dlaf9spms', 
  api_key: process.env.CLOUDINARY_API_KEY,  
  api_secret: process.env.CLOUDINARY_API_SECRET
});

//INDEX - Show all campgrounds
// router.get("/", function(req, res){
   
//     Campgrounds.find({},function(err, allCampgrounds){
//         if(err) {
//             console.log(err)
//         } else{
//            res.render("campgrounds/index",{campgrounds:allCampgrounds}); 
//         //, currentUser: req.user
//         }
//     })
    
// });

router.get("/", function(req, res){
  var noMatch = null;
  if(req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');
      // Get all campgrounds from DB
      Campgrounds.find({name: regex}, function(err, allCampgrounds){
         if(err){
             console.log(err);
         } else {
            if(allCampgrounds.length < 1) {
                noMatch = "No campgrounds match that query, please try again.";
            }
            res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
           
         }
      });
  } else {
      // Get all campgrounds from DB
      Campgrounds.find({}, function(err, allCampgrounds){
         if(err){
             console.log(err);
         } else {
            res.render("campgrounds/index",{campgrounds:allCampgrounds, noMatch: noMatch});
         }
      });
  }
});

// CREATE NEW CAMPGROUND AND ADD MULTIPLE IMAGES
router.post("/", middleware.isLoggedIn, upload.array("image"), async function(req, res){
  // add author to campground
  req.body.campground.author = {
      id: req.user._id,
      username: req.user.username
  };
  req.body.campground.imageId = [];
  req.body.campground.image = [];
  for (const file of req.files) {
      let result = await cloudinary.uploader.upload(file.path);
      
      (req.body.campground.imageId.push(result.public_id) && req.body.campground.image.push(result.secure_url));
  }
  
   // parse the geografic data and save    
   geocoder.geocode(req.body.location, function(err, data){
    if(err || !data.length){
        req.flash('error', 'Invalid address');
        return res.redirect('back');
    } 
    //parse the object campground
    req.body.campground.lat =     data[0].latitude;
    req.body.campground.lng  =     data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;

  Campgrounds.create(req.body.campground, function(err, campground) {
      if (err) {
          return res.redirect('back');
      }
      console.log("request.body contains the following: ")
      campground.save();
      res.redirect('/campgrounds/' + campground.id);
  });
});
});

// NEW -Show form to create a new campground
router.get("/new", middleware.isLoggedIn, function(req,res){
    res.render("campgrounds/new");
})

  

// SHOW - more info about one campground
router.get("/:id",  function(req,res){
    Campgrounds.findById(req.params.id).populate("comments").populate({
      path: "reviews",
      options: {sort: {createdAt: -1}}
  }).exec(function(err,foundCampground){
        if(err){
            console.log(err);
        } else {
            console.log(foundCampground);
            res.render("campgrounds/show", {campground:foundCampground});
        }
    });
    
});
 
router.get("/:id/viewMap", function(req, res){
 
Campgrounds.findById(req.params.id, function(err, mapCampground){
  if(err){
    console.log(err);
} else {
    console.log(mapCampground);
    res.render("campgrounds/viewMap", {campground:mapCampground});
}
})
})

router.get("/:id/bookNow", middleware.isLoggedIn, function(req, res){
  Campgrounds.findById(req.params.id, function(err, bookCampground){
    if(err){
      console.log(err);
  } else {
    res.render("campgrounds/bookNow", {campground: bookCampground});
  }
  })
  
});

router.post("/id/bookNow", function(req, res){
  req.flash("success","Successfully Booked! Thank you for booking with Let's Camp");
            res.redirect("/campgrounds");
  }  )

// EDIT CAMPGROUNDS
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
        // Check if the user is logged in
        Campgrounds.findById(req.params.id, function(err, foundCampground){
          if(err){
            console.log(err);
          } else{
                res.render("campgrounds/edit", {campground:foundCampground});
          }
                });
            });

                 

// ORIGINAL UPDATE CAMPGROUNDS
router.put("/:id", middleware.isLoggedIn, upload.array('image'), function(req, res){
  geocoder.geocode(req.body.location, function(err,data){
    if(err || !data.length){
        req.flash('error', 'Invalid address');
        return res.redirect('back');
    } 
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
  
    Campgrounds.findByIdAndUpdate(req.params.id, req.body.campground, async function(err, campground){
      if(err){
          req.flash("error", err.message);
          res.redirect("back");
      } else {
          if (req.file) {
            // const file = dataUri(req).content;
            try {
                await cloudinary.v2.uploader.destroy(req.body.campground.image);
                // req.body.campground.image = [];
                for (const file of req.files) {
                  let result = await cloudinary.uploader.upload(req.file.path);
                  campground.image.push(result.secure_url);
                }
                 
            } catch(err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
          }
          campground.location = req.body.location;
          campground.price = req.body.campground.price;
          campground.name = req.body.campground.name;
          campground.description = req.body.campground.description;
          
              campground.save();
            req.flash("success","Successfully Updated!");
            res.redirect("/campgrounds/" + campground._id);

          console.log("request.body.campground contains the following: ")
          console.log(req.body.campground)
         
        
          }
            
  }


);
})
})


//DELETE ROUTE
router.delete('/:id', function(req, res) {
  Campgrounds.findById(req.params.id, async function(err, campground) {
    if(err) {
      req.flash("error", err.message);
       res.redirect("back");
    } else {
    console.log(campground);
    try {
      // campground.image = req.body.campground.image;
        await cloudinary.v2.uploader.destroy([campground.image]);
       
    } catch(err) {
        if(err) {
          req.flash("error", err.message);
          return res.redirect("back");
        }
    } 
    Comment.remove({"_id": {$in: campground.comments}}, function (err) {
      if (err) {
          console.log(err);
          return res.redirect("/campgrounds");
      }
      // deletes all reviews associated with the campground
      Review.remove({"_id": {$in: campground.reviews}}, function (err) {
          if (err) {
              console.log(err);
              return res.redirect("/campgrounds");
          }
          campground.remove();
          req.flash('success', 'Campground deleted successfully!');
          res.redirect('/campgrounds');
  });
  });
}
  });
});
  

  function escapeRegex(text) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

//making a middleware to find whether the user owns the campgrounds to be edited

module.exports = router;
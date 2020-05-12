require("dotenv").config();


var express                  =  require("express"),
    app                      =  express(),
    bodyParser               =  require("body-parser"),
    mongoose                 =  require("mongoose"),
    Campgrounds              =  require("./models/campground"),
    Comment                  =  require("./models/comment"),
    seedDB                   =  require("./seeds"),
    flash                    =  require("connect-flash"),
    passport                 =  require("passport"),
    localStrategy            =  require("passport-local"),
    User                     =  require("./models/user"),
    expressSession           =  require("express-session"),
    methodOverride           =  require("method-override")

var commentRoute             = require("./routes/comment"),
    reviewRoutes             = require("./routes/reviews")
    campgroundRoute          = require("./routes/campgrounds"),
    indexRoute               = require("./routes/index")
    

mongoose.connect("mongodb://localhost:27017/yelp_camp",{useNewUrlParser:true, useUnifiedTopology:true});
                

var db = mongoose.connection;

db.on('error',console.error.bind(console,'connection error:'));
db.once('open',function(){
    console.log("Connection successful");
}); 

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


app.set("view engine" , "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method")); 
app.use(flash());


// newly added

//till here

app.locals.moment = require('moment');
// seed database
//seedDB();

// PASSPORT CONFIGURATION 

app.use(expressSession({
    secret: "Once again Rocky and Tiger are good boys",
    resave: false,
    saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// middleware for every route to know if user is logged in or not
app.use(function(req, res, next){
    res.locals.currentUser = req.user;
    res.locals.error     = req.flash("error");
    res.locals.success     = req.flash("success");
    next();
})
app.use("/",indexRoute);

app.use("/campgrounds", campgroundRoute);
//appends /campgrounds for all routes

app.use("/campgrounds/:id/comments/",commentRoute);
//appends /campgrounds/:id/comments/ for all routes

app.use("/campgrounds/:id/reviews", reviewRoutes);






app.listen(4567,function(){
    console.log("The Yelp Camp Server has started!")
});


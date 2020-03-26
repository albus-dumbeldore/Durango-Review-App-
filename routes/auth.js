var express     = require("express");
var router      = express.Router();
var passport    = require("passport");
var User        = require("../models/user.js");
var Comment = require("../models/comment");
var Campground = require("../models/campground");
var middleware = require("../middleware");
var multer = require("multer");
var storage = multer.diskStorage({
  filename: function(req, file, callback) {
    callback(null, Date.now() + file.originalname);
  }
});
var imageFilter = function(req, file, cb) {
  // accept image files only
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/i)) {
    return cb(new Error("Only image files are allowed!"), false);
  }
  cb(null, true);
};
var upload = multer({
  storage: storage,
  fileFilter: imageFilter
});

var cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "dvemjp1iw",
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// root route
router.get("/",(req,res)=>{
    res.render("landing");
});


// --------------------------------------Auth routes----------------------------------------------

// show the register form
router.get("/register",(req,res)=>{
    if(req.user){
        return res.redirect("/campgrounds");
    }
    res.render("register");
});

// handle sign up logic
router.post("/register",upload.single("image"),(req,res)=>{
  // console.log("a to ra hu yaar");
    // if(req.file){
    //   console.log("bhenchod kutte");
    // }
    // console.log("le lode username " +req.body.name)
    if(req.file==undefined){
      // console.log("yha pe aya1");
        var newUser = new User({
            username : req.body.username,
            email    : req.body.email,
            phone    : req.body.phone,
            fullname : req.body.fullName,
            image    : "",
            imageId  : ""
        });
        User.register(newUser,req.body.password,(err,user)=>{
            if(err){
                // console.log(err.message);
                req.flash("error",err.message);
                // return res.render("register");
                return res.redirect("/register")
            }
            passport.authenticate("local")(req,res,()=>{
                req.flash("success","Successfuly Registered")
                return res.redirect("/campgrounds");
            });
        });
    }
    else{
        // console.log("yha pe aya");
        cloudinary.v2.uploader.upload(req.file.path,{width:400,height:400,gravity:"center",crop:"scale"},(err,result)=>{
            if(err){
                req.flash("error",err.message);
                return res.redirect("back");
            }
            // req.flash("success","Successfuly Registered")
            console.log(result.secure_url);
            req.body.image = result.secure_url;
            req.body.imageId=result.public_id;
            var newUser = new User({
                username : req.body.username,
                email    : req.body.email,
                phone    : req.body.phone,
                fullName : req.body.fullName,
                image    : req.body.image,
                imageId  : req.body.imageId
                
            });
            User.register(newUser,req.body.password,(err,user)=>{
                if(err){
                    // req.flash()
                    return res.render("register",{error:err.message});
                }
                passport.authenticate("local")(req,res,()=>{
                    req.flash("success","Successfuly Registered")
                    res.redirect("/campgrounds");
                });
            });

        });
    }
    
});

// show login form
router.get("/login",(req,res)=>{
    if(req.user){
        return res.redirect("/campgrounds");
    }
    res.render("login");
});


//resposible for handling login logic
router.post("/login",passport.authenticate("local",
    {
        successRedirect:"/campgrounds",
        failureRedirect:"/login",
        failureFlash:"Invalid Username or Password",
        successFlash:"Successfully Login"

    }),(req,res)=>{
      // console.log(err.message)
      

});

// router.post('/login',
//   passport.authenticate('local', { successRedirect: '/campgrounds',
//                                    failureRedirect: '/login',failureFlash:"Invalid Username or Password",successFlash:"Successfully Login" }));

// Logout
router.get("/logout",(req,res)=>{
    req.logout();
    req.flash("success","Logged You Out");
    res.redirect("/login");
});


// user profile
router.get("/users/:user_id", function(req, res) {
    User.findById(req.params.user_id, function(err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "This user doesn't exist");
        return res.render("error");
      }
      Campground.find()
        .where("author.id")
        .equals(foundUser._id)
        .exec(function(err, campgrounds) {
          if (err) {
            req.flash("error", "Something went wrong");
            res.render("error");
          }
          Comment.find()
            .where("author.id")
            .equals(foundUser._id)
            .exec(function(err, ratedCount) {
              if (err) {
                req.flash("error", "Something went wrong");
                res.render("error");
              }
              res.render("users/show", {
                user: foundUser,
                campgrounds: campgrounds,
                reviews: ratedCount
              });
            });
        });
    });
  });

  // edit profile
router.get("/users/:user_id/edit",middleware.isLoggedIn,(req, res)=> {
    // console.log(req.user.author.id,req.user.author.username);
    // console.log("ha mai ara yha")
    console.log(req.user)
    res.render("users/edit",{user: req.user});
  });

// update profile
router.put("/users/:user_id",upload.single("image"),(req,res)=>{
  
  User.findById(req.params.user_id,(err,user)=>{
    user.email = req.body.email;
    user.phone = req.body.phone;
    user.fullName = req.body.fullName;
    // if(req.file){
    //   console.log("ha aya hu lode");
    // }
    // console.log(req.body);
    if(req.file){
      cloudinary.v2.uploader.destroy(user.imageId,(err,result)=>{
        if(err){
          req.flash("error",err.message);
          return res.redirect("back");
        }
        cloudinary.v2.uploader.upload(req.file.path,{width:1500,height:1000,crop:"scale"},(err,result)=>{
          // console.log("ha beta le0 " + result.secure_url)
          if(err){
            req.flash("error",err.message);
            return res.redirect("back");
          }
          user.imageId=result.public_id;
          user.image  = result.secure_url;
          

        });
      });

    }
    user.save();
    req.flash("success","Updated your profile");  
    res.redirect("/users/"+req.params.user_id);

  });
});


// destroy profile
router.delete("/users/:user_id",middleware.checkProfileOwnership,(req,res)=>{

  User.findById(req.params.user_id,(err,user)=>{
      console.log("mai aya hua yaar");  
    if(err){
        req.flash("error",err.message);
        return res.redirect("back");
      }
      if(user.image === ""){
        user.remove();
        req.flash("success","Account Deleted")
        return res.redirect("/login");
      }
      cloudinary.v2.uploader.destroy(user.imageId,(err)=>{
        // if(err){
        //   req.flash("error",err.message);
        //   return res.redirect("back");
        // }
        console.log("remove to hogya")
        user.remove();
        req.flash("success","Profile has been deleted")
        return res.redirect("/campgrounds");
      })
    }) ;
  });
  
  
  




// middleware-which use first and forward.
function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();   
    }
    res.redirect("/login");
}

router.get("/about", function(req, res) {
    res.render("about");
});

module.exports = router;
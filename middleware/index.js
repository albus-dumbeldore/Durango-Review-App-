// all the middlewares goes here
var Campground = require("../models/campground.js");
var Comment    = require("../models/comment.js");
var User    = require("../models/user.js");
var middlewareObj = {};

middlewareObj.checkCampgroundOwnership = function(req,res,next){
    
    
        if(req.isAuthenticated()){  


            Campground.findById(req.params.id,(err,foundCampground)=>{
                if(err){
                    req.flash("error","Campground not found!");
                    res.redirect("back");
                }
                else{
                    // does user own a campground or not??
                    if(foundCampground.author.id.equals(req.user._id)){
                        next();

                    } else{
                            req.flash("error","You don't have Permission!");
                            res.redirect("back");
                        

                    }
                }
            });

        } else{
            req.flash("error","You need to be Logged in to that!");
            res.redirect("back");

        }
}
middlewareObj.checkCommentsOwnership = function(req,res,next){
    if(req.isAuthenticated()){


        Comment.findById(req.params.comment_id,(err,foundComment)=>{
            if(err){
                res.redirect("back");
            }
            else{
                  // does user own a campground or not??
                if(foundComment.author.id.equals(req.user._id)){
                    next();

                } else{
                        req.flash("error","You don't have permission to do that!");
                        res.redirect("back");
                    

                }
            }
        });

    } else{
        req.flash("error","You need to be logged in to do that!");
        res.redirect("back");

    }
}

middlewareObj.checkProfileOwnership = function(req, res, next) {
    User.findById(req.params.user_id, function(err, foundUser) {
      if (err || !foundUser) {
        req.flash("error", "Sorry, that user doesn't exist");
        res.redirect("/campgrounds");
      } else if (foundUser._id.equals(req.user._id)) {
        req.user = foundUser;
        next();
      } else {
        req.flash("error", "You don't have permission to do that!");
        res.redirect("/campgrounds/" + req.params.user_id);
      }
    });
  };

middlewareObj.isLoggedIn = function(req,res,next){
    // middleware

    if(req.isAuthenticated()){
        return next();   
    }
    req.flash("error","You need to be Logged to do that!");

    res.redirect("/login");


}



module.exports = middlewareObj;
var express     = require("express");
var router      = express.Router();
var Campground  = require("../models/campground.js");
var Comment     = require("../models/comment.js");
var middleware  = require("../middleware");


// var router      = express.Router({mergeParams:true});

// comments new route
router.get("/campgrounds/:id/comments/new",middleware.isLoggedIn,(req,res)=>{
    Campground.findById(req.params.id,(err,campground)=>{
        if(err){
            console.log(err);
        }
        else{
            res.render("comments/new",{campground:campground});

        }
    });
    
});

// comments create route

router.post("/campgrounds/:id/comments",middleware.isLoggedIn,(req,res)=>{
    Campground.findById(req.params.id, function(err, found) {
        if (err) {
          console.log(err);
        }
        var ratedArray = [];
        found.hasRated.forEach(function(rated) {
          ratedArray.push(String(rated));
        });
        if (ratedArray.includes(String(req.user._id))) {
          req.flash(
            "error",
            "You've already reviewed this campgroud, please edit your review instead."
          );
          res.redirect("/campgrounds/" + req.params.id);
        } else {
          Campground.findById(req.params.id, function(err, campground) {
            if (err) {
              console.log(err);
              res.redirect("/campgrounds");
            } else {
              var newComment = req.body.comment;
              Comment.create(newComment, function(err, comment) {
                if (err) {
                  req.flash("error", "Something went wrong.");
                  res.render("error");
                } else {
                  // add username and id to comment
                  comment.author.id = req.user._id;
                  comment.author.username = req.user.username;
                  campground.hasRated.push(req.user._id);
                  campground.rateCount = campground.comments.length;
                  // save comment
                  comment.save();
                  campground.comments.push(comment);
                  campground.save();
                  req.flash("success", "Successfully added review!");
                  res.redirect("/campgrounds/" + campground._id);
                }
              });
            }
          });
        }
      });
    });
          
              

// Edit route

router.get("/campgrounds/:id/comments/:comment_id/edit",middleware.checkCommentsOwnership,(req,res)=>{
    // res.send("comments page");
    Comment.findById(req.params.comment_id,(err,foundComment)=>{
        if(err){
            res.redirect("back");
        } 
        else{
            // res.render("comments/edit",{})
            res.render("comments/edit",{campground_id:req.params.id,comment:foundComment});
        }
    });
    

});

// update route

router.put("/campgrounds/:id/comments/:comment_id",middleware.checkCommentsOwnership,(req,res)=>{
    // res.send("you hit update route");
    Comment.findByIdAndUpdate(req.params.comment_id,req.body.comment,(err,updateComments)=>{
        if(err){
            res.redirect("back");
        }
        else{
            req.flash("success","Review Update");
            res.redirect("/campgrounds/" + req.params.id);
        }
    });
});


// // comment destroy route
// router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentsOwnership,(req,res)=>{
//     Comment.findByIdAndRemove(req.params.comment_id,(err)=>{
//         if(err){
//             res.redirect("back");
//         }
//         else{
//             req.flash("success","Comment deleted!");
//             res.redirect("/campgrounds/" + req.params.id);
//         }
//     });  
// });
router.delete("/campgrounds/:id/comments/:comment_id",middleware.checkCommentsOwnership,(req,res)=>{
    Comment.findByIdAndRemove(req.params.comment_id, function(err) {
      if (err) {
        res.redirect("back");
      } else {
        // Campground.findByIdAndUpdate(
        //   req.params.id,
        //   { $pull: { comments: { $in: [req.params.comment_id] } } },
        //   function(err) {
        //     if (err) {
        //       console.log(err);
        //     }
        //   }
        // );
        Campground.findByIdAndUpdate(
          req.params.id,
          { $pull: { hasRated: { $in: [req.user._id] } } },
          function(err) {
            if (err) {
              console.log(er);
            }
          }
        );
        req.flash("success", "Review deleted!");
        res.redirect("/campgrounds/" + req.params.id);
      }
    });
  });





module.exports = router;
var mongoose   = require("mongoose");
var Campground = require("./models/campground");
var Comment    = require("./models/comment");


var data = [
    {
        name:"Clouds Rest",
        image:"https://photosforclass.com/download/pixabay-1189929?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2F57e1dd4a4350a514f6da8c7dda793f7f1636dfe2564c704c7d2c7dd49649c05d_960.jpg&user=Noel_Bauza",
        description:"blah blah blah"
    },
    {
        name:"Desert mesa",
        image:"https://photosforclass.com/download/pixabay-2594975?webUrl=https%3A%2F%2Fpixabay.com%2Fget%2F54e5dc474355a914f6da8c7dda793f7f1636dfe2564c704c7d2c7dd49649c05d_960.jpg&user=StockSnap",
        description:"blah blah blah"
    },
    {
        name:"Canion Bey",
        image:"https://photosforclass.com/download/pixabay-2594975?webUrl=https://pixabay.com/get/54e5dc474355a914f6da8c7dda793f7f1636dfe2564c704c7d2c7dd49649c05d_960.jpg&user=StockSnap",
        description:"blah blah blah"
    }
]

function seedDB(){
    // Remocve all campgrounds
    Campground.remove({},(err)=>{
        if(err){
            console.log(err);
        }
        else{
            console.log("Campground removed");
            data.forEach((seed)=>{
                Campground.create(seed,(err,campground)=>{
                    if(err){
                        console.log(err);
                    }
                    else{
                        console.log("added a campground");

                        Comment.create(
                            {
                                text:"this place is great",
                                author:"homer"
                            },function(err,comment){
                                if(err){
                                    console.log(err);
                                }
                                else{
                                    campground.comments.push(comment);
                                    campground.save();
                                    console.log("Created new comment");
                                }
                            }
                        )
                    }
                });
            });
        }
    });
    
}

// Campground

module.exports = seedDB;

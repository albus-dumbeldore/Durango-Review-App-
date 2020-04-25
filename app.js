require('dotenv').config();


var express         = require('express'),
     flash          = require("connect-flash"), 
     bodyParser     = require("body-parser"),
     mongoose       = require("mongoose"),
     Campground     = require("./models/campground.js"),
     seedDB         = require("./seed.js"),
     Comment        = require("./models/comment"),
     passport       = require("passport"),
     LocalStrategy  = require("passport-local"),
     User           = require("./models/user"),
     methodOverride = require("method-override"),
     passportLocalMongoose   =require("passport-local-mongoose");
     http           = require('http')

var app             = express()
var server          = http.createServer(app)
var port            = process.env.PORT || 3000

// ===================================Routes Require ===========================================================
var campgroundsRoutes = require("./routes/campgrounds.js");
var commentRoutes     = require("./routes/comments.js");    
var authRoutes        = require("./routes/auth.js")
// ====================================End=====================================================================




// mongoose.set('useNewUrlParser', true);
// mongoose.set('useUnifiedTopology',true);
// mongoose.connect("mongodb://localhost/manhattan4",{useNewUrlParser:true});



//============================================================================================================     
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static(__dirname + "/public"));	
app.use(methodOverride("_method"));
app.use(flash());
app.locals.moment = require("moment");

//=========================Not to write ejs again agian=======================================================
                        app.set("view engine","ejs");
//============================================================================================================


// Seed database
// seedDB();


//============================ Passport Configuration======================================================
app.use(require("express-session")({
    secret:"Once again Rusty wins cutest dog!",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session()); 
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// =====================================Pasport End======================================================




// =========================Define currentUser to use in any ejs file in header file without passing into the object
app.use(function(req,res,next){
    res.locals.currentUser = req.user;
    res.locals.error     = req.flash("error");
    res.locals.success   = req.flash("success");
    next();
});
// =============================End=============================================================================




//====================================Routes use which are in routes directory================================
app.use(authRoutes);
app.use(campgroundsRoutes);
app.use(commentRoutes);


// ===========================================================================================================


// app.listen(process.env.PORT || 3000)
// app.listen(3000,()=>{
//     console.log("port http://localhost:3000");
// });

server.listen(port,()=>{
    console.log('Server is on port ' + 3000) 
})
let express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    passport    = require("passport"),
    cookieParser = require("cookie-parser"),
    LocalStrategy = require("passport-local"),
    flash        = require("connect-flash"),
    Post        = require("./models/post"),
    User        = require("./models/user"),
    session = require("express-session"),
    methodOverride = require("method-override");
    
// Requiring routes
let profileRoutes = require("./routes/profiles"),
    indexRoutes      = require("./routes/index")

// DB connection and setting up stuff
mongoose.connect("mongodb://localhost/shareD",{
    useNewUrlParser:true,
    useUnifiedTopology:true,
    useCreateIndex:true,
    useFindAndModify: false
});
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));
app.use(flash());

// Configure passport
app.use(require("express-session")({
    secret: "This is awesome, right?",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.success = req.flash('success');
   res.locals.error = req.flash('error');
   next();
});

// Use all routes
app.use("/", indexRoutes);
app.use("/profile", profileRoutes);

app.listen(3000, function(){
   console.log("ShareD Server Has Started!");
});
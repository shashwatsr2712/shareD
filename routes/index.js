var express=require("express");
var router=express.Router();
var passport=require("passport");
var User=require("../models/user");
var Post=require("../models/post");
var Comment=require("../models/comment");
var multer=require('multer'); 
var middleware=require('../middleware/index.js')

// Configure multer storage
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname+"-"+Date.now());
    }
});
var upload = multer({
    storage: storage
});

// Register routes
router.get("/register",function(req,res){
    res.render("register");
});

router.post("/register",upload.single("file"),function(req, res){
    if(req.file===undefined){ // No file uploaded
        var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            name: req.body.name,
            bio: req.body.bio,
        });
    } else{ // Profile photo uploaded
        let photo={
            path:req.file.path,
            originalname:req.file.filename // this is not actually the "original" name, but the modified one (by multer)
        };
        var newUser = new User({
            username: req.body.username,
            email: req.body.email,
            name: req.body.name,
            bio: req.body.bio,
            photo: photo
        });
    }
    User.register(newUser, req.body.password, function(err, user){
        if(err){
            console.log(err);
            req.flash("error", err.message);
            return res.render("register");
        }
        passport.authenticate("local")(req, res, function(){
           req.flash("success", "Successfully Signed Up! Great to have you on-board " + req.body.username);
           res.redirect("/"); 
        });
    });
});

// Login/Logout routes
router.get("/login",function(req,res){
    res.render("login");
});

router.post("/login",passport.authenticate("local",
    {
        successRedirect:"/",
        failureRedirect:"/login"
    }),function(req,res){
});

router.get("/logout",function(req,res){
    req.logout();
    req.flash("success", "LOGGED YOU OUT!");
    res.redirect("/");
});

// Root route
router.get("/",function(req,res){
    let sort_by={}; // using no parameter will give array in chronological order
    // we can reverse this to sort by recent
    let sortby='Recent'; // variable used in frontend 
    if(Object.keys(req.query).length>0 && req.query.sortby=='Likes'){
        sort_by={likes_count:1};
        sortby='Likes';
    } else{
        // ignore other queries and sort by 'recent'
    }
    Post.find({}).sort(sort_by).exec(function(err,allPosts){
        if(err){
            console.log(err);
        } else{
            res.render("landing",{posts:allPosts.reverse(),sortby:sortby});
        }
    });
});

// Submission action of new post
router.post("/",middleware.isLoggedIn,upload.single("file"),function(req,res){
    let title=req.body.title;
    let desc=req.body.description;
    let author={
        id:req.user._id,
        username:req.user.username
    };
    let path=req.file.path;
    let mimetype=req.file.mimetype;
    let originalname=req.file.filename; // this is not actually the "original" name, but the modified one (by multer)
    let new_post={title:title,path:path,originalname:originalname,mimetype:mimetype,description:desc,author:author};
    Post.create(new_post,function(err,newlyCreated){
        if(err)
            console.log(err);
        else
            res.redirect("/");
    });
});

// Show form for new post
router.get("/new",middleware.isLoggedIn,function(req,res){
    res.render("new");
});

// Show rank page which ranks users based on total likes for their posts
router.get('/rank',function(req,res){
    Post.find({},function(err,allPosts){
        if(err){
            console.log(err);
        }
        else{
            // An object with keys as author names and values as the total likes for him/her
            user_ranks={};
            allPosts.forEach(function(post){
                let author_name=post.author.username;
                user_ranks[author_name]=(user_ranks[author_name]+post.likes_count) || post.likes_count;
            })
            // To sort object properties, convert it into an array
            let ranklist=[];
            for(let author in user_ranks){
                ranklist.push([author,user_ranks[author]]);
            }
            ranklist.sort(function(a, b){ // sort in descending order of likes
                return b[1]-a[1];
            });
            res.render("rank",{ranklist:ranklist});
        } 
    });
});

// AJAX modify like count
router.post("/modifylike",middleware.isLoggedIn,function(req,res){
    if(req.body.flag==-1){ // Unlike
        Post.findById(req.body.id,function(err,foundPost){
            if(err){
                console.log(err);
            } else{
                new_likes=foundPost.likes.filter(function(obj) {
                    return obj.author.username!==req.user.username;
                });
                foundPost.likes=[];
                foundPost.likes.push(...new_likes);
                foundPost.likes_count-=1;
                foundPost.save();
                res.send(foundPost);
            }
        });
    } else{ // Like
        Post.findById(req.body.id,function(err,foundPost){
            if(err){
                console.log(err);
            } else{
                let liked_by={};
                liked_by.author={};
                liked_by.author.id=req.user._id;
                liked_by.author.username=req.user.username;
                foundPost.likes.push(liked_by);
                foundPost.likes_count+=1;
                foundPost.save();
                res.send(foundPost);
            }
        });
    }
});

// AJAX search profile by username
router.post("/searchusers",function(req,res){
    let quer=req.body.search;
    // 'i' is for case insensitive
    User.find({username:new RegExp(quer,'i')},function(err,foundUsers){
        if(err){
            console.log(err);
        } else{
            res.send(foundUsers);
        }
    });
});

// AJAX add comment for a post
router.post("/addcomment",middleware.isLoggedIn,function(req,res){
    let author={
        id:req.user._id,
        username:req.user.username
    };
    let post={
        id:req.body.post_id
    };
    let new_comment={description:req.body.description,timestamp:Date.now(),author:author,post:post};
    Comment.create(new_comment,function(err,newComment){
        if(err){
            console.log(err);
        } else{
            res.send(newComment);
        }
    });
});

// AJAX to view all comments for a post
router.post("/viewcomments",function(req,res){
    let post_id_for_comment=req.body.id;
    Comment.find({"post.id":post_id_for_comment},function(err,foundComments){
        if(err){
            console.log(err);
        } else{
            // Create a new array to be returned
            let foundCommentsMod=[], foundCommentMod={}, counter=0;
            if(foundComments.length==0){
                // Return empty array
                res.send(foundCommentsMod);
            } else{
                foundComments.forEach(function(foundComment){
                    counter+=1;
                    foundCommentMod={};
                    foundCommentMod.username=foundComment.author.username;
                    foundCommentMod.description=foundComment.description;
                    // Get just the date
                    foundCommentMod.timestamp=new Date(foundComment.timestamp).toDateString();
                    foundCommentsMod.push(foundCommentMod);
                    if(counter==foundComments.length){
                        return res.send(foundCommentsMod);
                    }
                });
            }
        }
    });
});

// Delete a post (only author has the rights)
router.delete("/:id",middleware.checkDeletingOwn,function(req,res){
    Post.findByIdAndRemove(req.params.id,function(err){
        if(err){
            req.flash("error", "Oops! Could not delete at this moment. Please try later.");
            res.redirect("/");
        } else{
            req.flash("success", "Successfully deleted Post!");
            res.redirect("/");
        }
    });
});

// ============================== Following code is for Reset password, currently not implemented
// Reset password
// router.get("/login/reset", function(req, res){
//     const sgMail = require('@sendgrid/mail');
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     let otp=Math.floor(1000+Math.random()*9000);
//     const msg = {
//     to: 'test@example.com',
//     from: 'test@example.com',
//     subject: 'OTP For Resetting password',
//     text: 'Enter the following OTP on the website to change password:',
//     html: `<h1>Enter the following OTP on the website to change password:</h1><br/>
//             <h2><strong>${otp}</strong></h2>`,
//     };
//     console.log(process.env.SENDGRID_API_KEY);
//     console.log(msg);
//     sgMail.send(msg).then(() => {
//         res.render('reset',{sentotp:otp});
//     }, ()=>{
//         req.flash("error", 'Some Error occured... Try Again!');
//         res.redirect('/');
//     }); 
// });

// // Handle reset password logic
// router.post("/login/reset", function(req, res){
//     if(req.body.sentotp!=req.body.otp){
//         req.flash("error", 'Some Error occured... Try Again!');
//         res.redirect('/');
//     } else{
//         User.findOne({"username":req.body.username},function(err,foundUser){
//             if(err){
//                 req.flash("error", 'Some Error occured... Try Again!');
//                 res.redirect('/'); 
//             } else{
//                 foundUser.setPassword(req.body.newpassword, function(err){
//                     if(err){
//                         req.flash("error", 'Some Error occured... Try Again!');
//                         res.redirect('/'); 
//                     } else{
//                         foundUser.save(function(err){
//                             if(err){
//                                 req.flash("error", 'Some Error occured... Try Again!');
//                                 res.redirect('/'); 
//                             } else{
//                                 req.flash("success", 'Password changed successfully!');
//                                 res.redirect("/");
//                             }
//                         });
//                     }
//                 });
//             }
//         });
//     }
// });

module.exports=router;
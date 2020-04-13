var express=require("express");
var router=express.Router();
var Post=require("../models/post");
var User=require("../models/user");
var multer=require('multer'); 
var middleware=require("../middleware");

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

// Show a profile
router.get('/:username',function(req,res){
    User.findOne({username:req.params.username},function(err,foundProfile){
        if(err){
            req.flash("error","Some error occured!");
            res.redirect("/");
        }
        else{
            if(foundProfile==null){
                req.flash("error","Your searched profile does not exist!");
                res.redirect("/");
            } else{
                // Decide whether or not to show the edit button
                let show_edit_button=false;
                if(!(req.user===undefined)){ // logged in
                    if(foundProfile.username==req.user.username){ // viewing own profile
                        show_edit_button=true;
                    }
                }
                // If searched profile exists, find total likes by scanning posts
                let like_count=0;
                Post.find({"author.username":req.params.username},function(err,foundPosts){
                    if(err){
                        console.log(err);
                    } else{
                        foundPosts.every(function(fpost,index){
                            like_count+=fpost.likes_count;
                        });
                        res.render("profiles/show",{profile:foundProfile,likes:like_count,edit:show_edit_button});
                    }
                });
            }
        } 
    });
});

// Show form to edit your own profile
router.get("/:username/edit",middleware.checkEditingOwn,function(req,res){
    res.render("profiles/edit");
});

// Submission action of editing profile
router.put("/:username",middleware.checkEditingOwn,upload.single("file"),function(req,res){
    if(!(req.file==undefined)){ // A file (profile photo) has been uploaded
        req.body.profile.photo={
            path:req.file.path,
            originalname:req.file.filename // this is not actually the "original" name, but the modified one (by multer)
        } 
    }
    User.findByIdAndUpdate(req.user._id,req.body.profile,function(err,updatedProfile){
        if(err){
             req.flash("error","Some error occured!");
             res.redirect("/profile/"+req.params.username);
        }
        else{
             req.flash("success","Successfully updated!");
             res.redirect("/profile/"+req.params.username);
        }
    });
});

// AJAX show posts for a username
router.post("/showposts",function(req,res){
    Post.find({"author.username":req.body.username},function(err,foundPosts){
        if(err){
            console.log(err);
        } else{
            if(foundPosts.length==0){
                foundPosts={};
            }
            res.send(foundPosts);
        }
    });
});

module.exports=router;
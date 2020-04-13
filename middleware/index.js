var Post = require("../models/post");

module.exports = {
    // Check if logged in
    isLoggedIn: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash("error", "You must be signed in to do that!");
        res.redirect("/login");
    },
    // Ensure that unauhorized/not-logged-in user is not editing a profile
    checkEditingOwn: function(req, res, next){
        if(req.isAuthenticated()){
            if(req.params.username==req.user.username){
                next();
            } else {
                req.flash("error", "You are not authorized to do that!");
                res.redirect("/profile/" + req.params.username);
            }
        } else {
            req.flash("error", "You are not authorized/signed-in to do that!");
            res.redirect("/");
        }
    },
    // Ensure that logged-in user is deleting his/her own post
    checkDeletingOwn: function(req,res,next){
        if(req.isAuthenticated()){
            if(req.query.author==req.user.username){
                next();
            } else {
                req.flash("error", "You are not authorized to do that!");
                res.redirect("/");
            }
        } else {
            req.flash("error", "You are not authorized/signed-in to do that!");
            res.redirect("/");
        }
    }
}
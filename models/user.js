var mongoose=require("mongoose");
var passportLocalMongoose=require("passport-local-mongoose");

var UserSchema=new mongoose.Schema({
    email:{type:String,unique:true,required:"Please enter your email"},
    username:{type:String,unique:true,required:"Please choose a username"},
    name:{type:String,required:"Please enter your name"},
    bio:String,
    photo:{
        path: {
            type: String,
            default:'public/uploads/default.png',
            trim: true
        },
        originalname: {
            type: String,
            default:'default.png'
        }
    },
    password:{type:String}
});

UserSchema.plugin(passportLocalMongoose);

module.exports=mongoose.model("User",UserSchema);
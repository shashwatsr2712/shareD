var mongoose=require("mongoose");

var commentSchema=new mongoose.Schema({
    description:String,
    timestamp:Date,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    post:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Post"
        }
    },
});

var Comment=mongoose.model("Comment",commentSchema);
module.exports=Comment;
var mongoose=require("mongoose");

var postSchema=new mongoose.Schema({
    title:String,
    path: {
        type: String,
        required: true,
        trim: true
    },
    originalname: {
        type: String,
        required: true
    },
    mimetype:{
        type: String,
        required: true
    },
    description:String,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    likes:[ // An array of users who have liked this post
        {
            author:{
                id:{
                    type:mongoose.Schema.Types.ObjectId,
                    ref:"User"
                },
                username:String
            }
        }
    ],
    likes_count:{
        type:Number,
        default:0
    }
});

var Post=mongoose.model("Post",postSchema);
module.exports=Post;
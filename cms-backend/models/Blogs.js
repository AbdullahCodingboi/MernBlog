import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  content: {
    type: String, 
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  tags: [String],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});
const commentSchema=new mongoose.Schema({
  user:{type:mongoose.Schema.Types.ObjectId,ref:"Uer"},
  content:{type:String,required:true},
  createdAt:{type:Date,default:Date.now},
})
const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },   // always store the final URL from Cloudinary
  publicId: { type: String, required: false },   // Cloudinary public ID for management
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", blogSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Image = mongoose.model("Image", imageSchema);
export { Blog, Comment, Image };

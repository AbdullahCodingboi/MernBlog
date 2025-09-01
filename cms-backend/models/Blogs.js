import mongoose from "mongoose";

// Blog schema
const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subtitle: {            // new
    type: String,
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
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  featuredImage: {       // new
    type: String,
  },
  estimatedReadingTime: { // new
    type: Number // in minutes
  }
}, { timestamps: true });

// Comment schema
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // typo fixed ("Uer" → "User")
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Image schema
const imageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },   // final URL from Cloudinary
  publicId: { type: String, required: false }, // Cloudinary public ID for management
  createdAt: { type: Date, default: Date.now }
});

const Blog = mongoose.model("Blog", blogSchema);
const Comment = mongoose.model("Comment", commentSchema);
const Image = mongoose.model("Image", imageSchema);

export { Blog, Comment, Image };

import {Blog,Comment,Image} from "../models/Blogs.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
export const CreateBlog=async (req,res)=>{
    try{
        const {title,content,tags} =req.body
        const blog=await Blog.create({
            title,
            content,
            tags,
            author:req.user.id
        })
        res.status(201).json({ message: "Blog created", blog });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
    
}
export const FetchAllBlogs=async(req,res)=>{
    try{
        const blogs=await Blog.find().populate("author", "username email").sort({createdAt:-1})
        res.json(blogs)
    }catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export const GetBlog=async (req,res)=>{
 try {
    const blog = await Blog.findById(req.params.id).populate("author", "username email");
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    res.json(blog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
    
}
export const AddComment=async(req,res)=>{
    try{
      const {content}=req.body
      const BlogId=req.params.id
       if (!content) return res.status(400).json({ message: "Comment cannot be empty" });
       const blog=await Blog.findById(BlogId)
      if (!blog) return res.status(404).json({ message: "Blog not found" });
      const comment=await Comment.create({
        content,
        author:req.user.id,
        blog:BlogId
      })
      blog.comments.push(comment._id)
      await blog.save()
      res.status(201).json({ message: "Comment added", comment });
    }catch (err) {
    res.status(500).json({ error: err.message });
  }
}
export const AddImage = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debug log
    const { imageBase64, imageUrl } = req.body;

    if (!imageBase64 && !imageUrl)
      return res.status(400).json({ message: "Image data or URL is required" });

    let uploadResult;

    if (imageBase64) {
      // Upload base64 image to Cloudinary
      uploadResult = await cloudinary.uploader.upload(imageBase64, {
        folder: "blog_images",
      });
    } else {
      // Use URL directly - generate a unique identifier since no Cloudinary public_id
      uploadResult = { 
        secure_url: imageUrl, 
        public_id: `direct_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` 
      };
    }

    const image = await Image.create({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      createdAt: new Date(),
    });

    // Return only the image URL
    res.status(201).json({ 
      message: "Image added",
      imageId:image._id ,
      imageUrl: image.imageUrl ,
      
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const DeleteImage = async (req, res) => {
   try {
    const { id } = req.params; // Get image ID from URL params
    
    // Find the image in database
    const image = await Image.findById(id);
    
    if (!image) {
      return res.status(404).json({ message: "Image not found" });
    }
     if (image.publicId && !image.publicId.startsWith('direct_upload_')) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
        console.log(`Deleted from Cloudinary: ${image.publicId}`);
      } catch (cloudinaryError) {
        console.error("Cloudinary deletion error:", cloudinaryError);
        // Continue with database deletion even if Cloudinary fails
      }
    }
    
    // Delete from database
    await Image.findByIdAndDelete(id);
    
    res.status(200).json({ 
      message: "Image deleted successfully",
      deletedImageId: id 
    });
    
  }catch (err) {
    res.status(500).json({ error: err.message });
  }

}

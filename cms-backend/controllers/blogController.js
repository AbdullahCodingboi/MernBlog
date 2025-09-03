import {Blog,Comment,Image} from "../models/Blogs.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import multer from "multer";
dotenv.config();
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  // Check if the file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
export const CreateBlog = async (req, res) => {
  try {
    console.log('Full request body:', req.body);
    console.log('Subtitle value:', req.body.subtitle);
    console.log('Type of subtitle:', typeof req.body.subtitle);
    
    // Simple approach - no destructuring
    const blogData = {
      title: req.body.title,
      content: req.body.content,
      tags: req.body.tags,
      author: req.user.id,
    };
    
    // Only add optional fields if they exist
    if (req.body.subtitle) {
      blogData.subtitle = req.body.subtitle;
    }
    
    if (req.body.readTime) {
      blogData.estimatedReadingTime = req.body.readTime;
    }
    
    if (req.body.featuredImage) {
      blogData.featuredImage = req.body.featuredImage;
    }
    
    console.log('Blog data to create:', blogData);
    
    const blog = await Blog.create(blogData);

    res.status(201).json({ 
      success: true,
      message: "Blog created successfully", 
      blog 
    });
  } catch (err) {
    console.error('Create blog error:', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
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
export const GetAllBlog=async (req,res)=>{
  try {
    const blogs = await Blog.find().sort({ createdAt: -1 }); // newest first
    res.json(blogs);
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
    console.log("Request body:", req.body); // Debug log for JSON fields
    console.log("File:", req.file);        // Debug log for uploaded file

    let uploadResult;

    // 1️⃣ Local file uploaded via Multer
    if (req.file) {
      // Upload to Cloudinary using a Promise for async/await
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "blog_images" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer); // send the file buffer
      });
    }

    // 2️⃣ Base64 image sent in JSON
    else if (req.body.imageBase64) {
      uploadResult = await cloudinary.uploader.upload(req.body.imageBase64, {
        folder: "blog_images",
      });
    }

    // 3️⃣ Image URL provided directly
    else if (req.body.imageUrl) {
      uploadResult = {
        secure_url: req.body.imageUrl,
        public_id: `direct_upload_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
    }

    else {
      return res.status(400).json({ message: "Image file, Base64, or URL is required" });
    }

    // Save the image info in MongoDB
    const image = await Image.create({
      imageUrl: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      createdAt: new Date(),
    });

    // Respond with the image info
    res.status(201).json({
      message: "Image added",
      imageId: image._id,
      imageUrl: image.imageUrl,
    });

  } catch (err) {
    console.error(err);
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
export const Likes=async (req,res)=>{
  const blogid=req.params.id
    console.log("typeof blogid:", typeof blogid, "value:", blogid);
 const userid = req.user.id;

  try{
    const blog=await Blog.findById(blogid)
    if(!blog) return res.status(404).json({ error: "Blog not found" });
    let action=''
    if(blog.likes.includes(userid)){
      blog.likes.pull(userid)
      action='unliked'
    }
    else{
      blog.likes.push(userid)
      action='liked'
    }
    blog.save()
    res.json({ action, likesCount: blog.likes.length });
  }catch(err){
    return  res.status(500).json(err)
  }
}
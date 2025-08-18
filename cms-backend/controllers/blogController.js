import {Blog,Comment} from "../models/Blogs.js";

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
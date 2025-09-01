import express from "express";
import { CreateBlog } from "../controllers/blogController.js";
// import { FetchAllBlogs } from "../controllers/blogController.js";
import { GetBlog } from "../controllers/blogController.js";
import { AddComment } from "../controllers/blogController.js";
import { AddImage } from "../controllers/blogController.js";
import { DeleteImage } from "../controllers/blogController.js";
import { Likes } from "../controllers/blogController.js";
import { protect } from "../middleware/authMiddleware.js";
import multer from "multer";
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() })
router.post("/",protect,  CreateBlog); 
// router.get("/", FetchAllBlogs);
router.get("/:id", GetBlog);
router.post("/:id/comments", protect, AddComment);
router.post("/:id/images", protect, upload.single("image"), AddImage);
router.delete("/:id/images/:imageId", protect, DeleteImage);
router.post("/:id/like", protect, Likes);
 
export default router;
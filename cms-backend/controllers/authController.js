
import bycrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
export const Signup=async(req,res)=>{
    try{
        const {username,email,password}=req.body
        const hashed=await bycrypt.hash(password,10)
        const user=await User.create({
            username,
            email,
            password:hashed
        })

    res.status(201).json({ message: "User created", user });
    }catch(err){
      if(err.code===11000){
        const field=Object.keys(err.keyValue)[0]
         return res.status(400).json({ message: `${field} already exists` });
              }
         res.status(500).json({ error: err.message });
    }
}

export const Login=async(req,res)=>{
    try{
        const {email,password}=req.body
        const user=await User.findOne({email})
        if (!user) return res.status(400).json({ message: "User not found" });


        const match=await bycrypt.compare(password,user.password)


        if (!match) return res.status(400).json({ message: "Invalid password" });

        const token=jwt.sign({id:user._id}, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ message: "Logged in", token });
    } catch (err) {
    res.status(500).json({ error: err.message });
  }

}
import type { Request,Response,NextFunction } from "express";
import bcrypt from "bcrypt";
import pool from "../db/pool.js"


export const signupPost=async(
    req:Request,
    res:Response,
    next:NextFunction
)=>{
    try{
        const {firstName,lastName,email,password}=req.body;
        const passwordHash=await bcrypt.hash(password,10);

        await pool.query(`INSERT INTO users (first_name,last_name,email,password_hash)
             VALUES ($1,$2,$3,$4)`, [firstName, lastName, email, passwordHash]);
 res.redirect("/login");
    }
    catch(error
    ){
        next(error);

    }
}
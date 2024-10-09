const express = require('express');
const  {Register,LogIn }  =require( "../controllers/auth.js");


const router = express.Router();




router.post("/register", Register);
router.post("/login", LogIn);

module.exports=router;
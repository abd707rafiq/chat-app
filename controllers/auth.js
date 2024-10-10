const User = require("../models/User.js");
const bcrypt = require("bcryptjs");
const Jwt = require("jsonwebtoken");
require('dotenv').config();

const Register=async(req,res)=>{
    const { username, email, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await  User.create({ username, email, password: hashedPassword });
        console.log(newUser);
        
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error("Error during registration: ", error.message);
        res.status(500).json({ error: 'Error registering user' });
    }

}



const LogIn=async(req,res)=>{
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'Invalid email or password' });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ error: 'Invalid email or password' });

        const token = Jwt.sign({ id: user._id },process.env.JWT_SECRET, { expiresIn: '10h' });
        res.status(200).json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }

}

module.exports = { Register, LogIn }
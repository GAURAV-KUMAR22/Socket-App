import { Router } from "express";
import becrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
// import { verifyToken } from "../Services/checkAuth.js";
import Users from "../model/user.js";
import { verifyToken } from "../Services/checkAuth.js";
const route = Router();

// *****************************************************************************************************************************************
//                               IN THIS FILE "AUTHORIZATION" AND "AUTHENTICATION" ROUTE
// *****************************************************************************************************************************************


route.post('/signup', async (req, res) => {
    console.log(req.body.userName)
    try {
        const { userName, email, password, phone } = req.body;
        if (!userName || !email || !password || !phone) {
            return res.status(500).send({ message: "All fields are required" });
        }
        if (!email.includes('@')) {
            return res.status(500).send({ message: 'Please provide a valid email' });
        }

        const existedUser = await Users.findOne({ email: email });
        if (existedUser) {
            return res.status(400).send({ message: "User already exists, please log in" });
        }

        const hashedPassword = await becrypt.hash(password, 12);

        const user = new Users({
            userName,
            email,
            password: hashedPassword,
            phone
        });

        await user.save();
        res.send({ message: "User successfully signed up", user });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred", error });
    }
});

route.post('/login', async (req, res) => {
    try {
        console.log('header', req.headers)
        const { email, password } = req.body;
        console.log(email, password)
        if (!email || !password) {
            return res.status(500).send({ message: "Email and password are required" });
        }

        const existedUser = await Users.findOne({ email });
        if (!existedUser) {
            return res.status(404).send({ message: "User does not exist" });
        }

        const isPasswordValid = becrypt.compareSync(password, existedUser.password);
        if (!isPasswordValid) {
            return res.status(400).send({ message: "Incorrect password" });
        }

        const payLoad = {
            token: uuidv4(),
            user: existedUser
        };

        const JWT_Token = await jwt.sign(payLoad, "MYBirthisMYSpecialDay", { expiresIn: '10d' });

        res.send({ message: "Login successfully registered", JWT_Token });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "An error occurred", error });
    }
});

export default route;

import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign(
        { id },
        process.env.JWT_SECRET,
        { expiresIn: "30d" }
    );
};

// Register
export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required..!"
            });
        }

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists..!"
            });
        }

        const hashedPassword = await bcrypt.hash(
            password,
            await bcrypt.genSalt(10)
        );

        const user = await User.create({
            name,
            email,
            password: hashedPassword
        });

        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            token,
            user
        });

    } catch (error) {
        console.error(
            "Register error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "All fields are required..!"
            });
        }

        const existingUser = await User.findOne({
            email
        });

        if (!existingUser) {
            return res.status(400).json({
                success: false,
                message: "Email does not exist..!"
            });
        }

        const isMatch =
            await bcrypt.compare(
                password,
                existingUser.password
            );

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message:
                    "Password not matched"
            });
        }

        const token = generateToken(
            existingUser._id
        );

        res.status(200).json({
            success: true,
            token,
            user: existingUser
        });

    } catch (error) {
        console.error(
            "Login error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// Get User
export const getUser = async (
    req,
    res
) => {
    try {
        const user = await User.findById(
            req.userId
        ).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message:
                    "User not found..."
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error(
            "Get user error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};

// import User from "../models/User.js"
// import jwt from "jsonwebtoken"
// import bcrypt from "bcrypt"


// //Generate the JWT Token...
// const generateToken = (id) =>{
//     return jwt.sign({id}, process.env.JWT_SECRET, {expiresIn:"30d"})
// }

// //register
// export const register = async(req, res) =>{
//     try{
//         const {name, email, password} = req.body;

//         if(!name|| !email || !password) {
//             return res.send(400).json({
//                 success:false,
//                 message:"All fields are required..!"
//             })
//         }

//         const existingUser = await User.findOne({email})
//         if(existingUser){
//             return res.send(400).json({
//                 success:false,
//                 message:"User already exists..!"
//             })
//         }

//         const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))

//         const user= await User.create({name, email, password:hashedPassword})

//         const token = generateToken(user._id)

//         res.status(201).json({
//             success:true,
//             token, user
//         })

//     }
//     catch(error){
//         console.error("Register error:", error.message)
//         res.status(500).json({
//             success:false,
//             message:"Server error"
//         })
//     }
// }

// //login
// export const login = async(req, res) =>{
//     try{
//         const {email, password} = req.body;

//         if(!email, !password) {
//             return res.send(400).json({
//                 success:false,
//                 message:"All fields are required..!"
//             })
//         }

//         const existingUser = await User.findOne({email})
//         if(!existingUser){
//             return res.send(400).json({
//                 success:false,
//                 message:"email is not exists..!"
//             })
//         }

//         const isMatch = await bcrypt.compare(password, user.password);
//         if(!isMatch){
//             return res.send(400).json({
//                 success:false,
//                 message:"password not matched"
//             })
//         }
//         // const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt(10))

//         // const user= await User.create({name, email, password:hashedPassword})

//         const token = generateToken(user._id)

//         res.status(201).json({
//             success:true,
//             token, user
//         })

//     }
//     catch(error){
//         console.error("Register error:", error.message)
//         res.status(500).json({
//             success:false,
//             message:"Server error"
//         })
//     }
// }


// export const getUser = async(req, res) =>{
//     try{
//         const user= await User.findById(req.userId).select("-password");
//         if(!user){
//             return res.status(400).json({
//                 success:false,
//                 message:"User not found..."
//             })
//         }

//         res.json({success:true, user})
//     }
//     catch(error){
//         console.error("Register error:",error.message);
//         res.status(500).json({
//             success:false,
//             message:"Server error"
//         })
//     }
// }
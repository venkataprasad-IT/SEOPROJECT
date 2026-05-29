import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
    try {
        const authHeader =
            req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith(
                "Bearer "
            )
        ) {
            return res.status(401).json({
                success: false,
                message:
                    "Not authorized, no token is there"
            });
        }

        const token =
            authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.userId = decoded.id;

        next();

    } catch (error) {

        console.error(
            "Auth middleware error:",
            error.message
        );

        return res.status(401).json({
            success: false,
            message:
                "Not authorized, token failed"
        });
    }
};

export default auth;

// import jwt from "jsonwebtoken"

// const auth  = async (req,res, next) =>{
//     try{
//         const authHeader = req.headers.authorization;

//         if(!authHeader || authHeader.startsWith("Bearer ")){
//             return res.status(401).json({
//                 success:false,
//                 message:"Not authorized, no token is there"
//             })
//         }

//         const token = authHeader.split(" ")[1];
//         const decoded = jwt.verify(token, process.env.JWT_SECRET)

//         req.userId= decoded.id;
//         next()
//     }
//     catch{
//         console.error("Auth middleware error:",erro.message);
//         return res.status(401).json({
//             success:false,
//             message:"Not authorized, token failed"
//         })
//     }
// }

// export default auth;
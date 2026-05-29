import KeywordTracking from "../models/keywordTracking.js";
import { keywordTracking } from "../services/keywordTrakingService.js";


// ADD KEYWORD
export const addKeyword = async (req, res) => {
    try {
        const { keyword, url } = req.body;

        if (!keyword || !url) {
            return res.status(400).json({
                success: false,
                message: "Keyword and URL are required!"
            });
        }

        // Extract domain from url
        let domain;

        try {
            const urlObj = new URL(
                url.startsWith("http") ? url : `https://${url}`
            );

            domain = urlObj.hostname.replace("www.", "");

        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid URL format!"
            });
        }

        // Check existing tracking 
        const existing = await KeywordTracking.findOne({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            domain
        });

        if (existing) {
            return res.status(400).json({
                success: false,
                message:
                    "Already tracking this keyword for this domain!"
            });
        }

        // Create tracking entry
        const tracking = await KeywordTracking.create({
            userId: req.userId,
            keyword: keyword.toLowerCase().trim(),
            url: url.startsWith("http")
                ? url
                : `https://${url}`,
            domain,
            status: "checking"
        });

        res.status(201).json({
            success: true,
            message: "Keyword tracking started",
            tracking
        });

        // Run background rank check
        keywordTracking(tracking);

    } catch (error) {

        console.error(
            "Add keyword error:",
            error.message
        );

        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message:
                    "Already tracking this keyword"
            });
        }

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// GET ALL KEYWORDS
export const getKeywords = async (req, res) => {
    try {

        const keywords = await KeywordTracking
            .find({
                userId: req.userId
            })
            .sort({
                createdAt: -1
            })
            .select("-rankHistory");

        res.json({
            success: true,
            keywords
        });

    } catch (error) {

        console.error(
            "Get keywords error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// GET SINGLE KEYWORD
export const getKeyword = async (req, res) => {

    try {

        const tracking =
            await KeywordTracking.findOne({
                _id: req.params.id,
                userId: req.userId
            });

        if (!tracking) {
            return res.status(404).json({
                success: false,
                message:
                    "Keyword tracking not found"
            });
        }

        res.json({
            success: true,
            tracking
        });

    } catch (error) {

        console.error(
            "Get keyword error:",
            error.message
        );

        res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
};



// MANUAL REFRESH
export const refreshKeyword =
    async (req, res) => {

        try {

            const tracking =
                await KeywordTracking.findOne({
                    _id: req.params.id,
                    userId: req.userId
                });

            if (!tracking) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Keyword tracking not found"
                });
            }

            tracking.status = "checking";

            await tracking.save();

            // Start rank tracking again
            keywordTracking(tracking);

            res.json({
                success: true,
                message:
                    "Rank check started"
            });

        } catch (error) {

            console.error(
                "Refresh keyword error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    };



// DELETE KEYWORD
export const deleteKeyword =
    async (req, res) => {

        try {

            const tracking =
                await KeywordTracking
                    .findOneAndDelete({
                        _id: req.params.id,
                        userId: req.userId
                    });

            if (!tracking) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Keyword tracking not found"
                });
            }

            res.json({
                success: true,
                message:
                    "Keyword tracking deleted"
            });

        } catch (error) {

            console.error(
                "Delete keyword error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    };



// TOGGLE ACTIVE / INACTIVE
export const toggleTracking =
    async (req, res) => {

        try {

            const tracking =
                await KeywordTracking.findOne({
                    _id: req.params.id,
                    userId: req.userId
                });

            if (!tracking) {
                return res.status(404).json({
                    success: false,
                    message:
                        "Keyword tracking not found"
                });
            }

            tracking.active =
                !tracking.active;

            await tracking.save();

            res.json({
                success: true,
                message:
                    `Tracking ${
                        tracking.active
                            ? "enabled"
                            : "disabled"
                    }`,
                active:
                    tracking.active
            });

        } catch (error) {

            console.error(
                "Toggle tracking error:",
                error.message
            );

            res.status(500).json({
                success: false,
                message: "Server error"
            });
        }
    };

// import KeywordTracking from "../models/keywordTracking";
// import { keywordTracking } from "../services/keywordTrakingService";

// //adding any keyword....!
// export const addKeyword= async (req, res)=>{
// try{
//     const {keyword, url}= req.body;

//     if(!keyword ||!url){
//          return res.status(400).json({
//                 success: false,
//                 message: "Keyword and the url required..!"
//             });
//     }

//     //extract domain from url
//     let domain;
//     try{
//         const urlObj = new URL(url.startsWith("http")? url:`https://${url}`);
//         domain = urlObj.hostname.replace("www.","");
//     }catch{
//          return res.status(400).json({
//                 success: false,
//                 message: "Invalid URL format..!"
//             });
//     }
//     //check if already existed or not...
//     const existing = await KeywordTracking.findOne({
//         userId:req.userId, keyword:keyword.toLowerCase().trim(), domain
//     })

//     if(existing){
//           return res.status(400).json({
//                 success: false,
//                 message: "Already tracking this keyword for the domain..!"
//             });
//     }

//     //create trackiing entry
//     const tracking = await  KeywordTracking.create({
//         userId:req.userId,
//         keyword:keyword.toLowerCase().trim(),
//         url: url.startsWith("http")?url:`https:${url}`,
//         domain,
//         status:"checking"
//     })

//     res.status(201).json({
//         success:true,
//         message:"Keyword tracking started", tracking
//     })
//     keywordTracking(tracking)
// }
// catch(error){
//     console.error("Add keyword errror:", error.message);
//     if(error.code === 110000){
//         return res.status(400).json({
//             success:false,
//             message:"Alreadu tracking this keyword"
//         })

//     }
    
//         res.status(500).json({
//             success:false, message:"Server error"
//         })

     
// }
// }

// //Get all tracked keywords.. for user
// export const getKeywords = async(req, res) =>{
//  try{
//     const keyword = await keywordTracking.find({userId:req.userId}).sort({
//         createdAt: -1
//     }).select("-rankHistory")
//     res.json({
//         success:true, keywords
//     })
//  }
//  catch(error){
//     console.error("Get Keywords error:", error.message);
//     res.status(500).json({
//         success:false, message:"Server error"
//     })
//  }
// }

// //get single keyword.... 
// export const getKeyword =async (req, res) =>{
// try{
//     const trackiing = await keywordTracking.findOne({_id:req.params.id, userId:req.userId}) 
//     if(!trackiing){
//         return res.status(404).json({
//             success:false, message:"keyword tracking not found"
//         })
//     }
//      res.json({
//         success:true, trackiing
//     })
//  }
//  catch(error){
//     console.error("Get Keyword error:", error.message);
//     res.status(500).json({
//         success:false, message:"Server error"
//     })
//  }
// }

// //Manually refresh
// export const refreshKeyword  = async (req, res)=>{
// try{
//     const trackiing = await KeywordTracking.findOne({_id:req.params.id, userId:req.userId}) 
//     if(!trackiing){
//         return res.status(404).json({
//             success:false, message:"keyword tracking not found"
//         })
//     }

//     trackiing.status = "checking";
//     await trackiing.save()
//      res.json({
//         success:true, message:"Rank check started.."
//     })
//  }
//  catch(error){
//     console.error("Refresh Keyword error:", error.message);
//     res.status(500).json({
//         success:false, message:"Server error"
//     })
//  }
// }

// //delete the keyword
// export const deleteKeyword= async (req, res)=>{
//  try{
//     const trackiing = await KeywordTracking.findByIdAndDelete({_id:req.params.id, userId:req.userId}) 
//     if(!trackiing){
//         return res.status(404).json({
//             success:false, message:"keyword tracking not found"
//         })
//     }  
//      res.json({
//         success:true, message:"Keyword tracking deleted"
//     })
//  }
//  catch(error){
//     console.error("Delete Keyword error:", error.message);
//     res.status(500).json({
//         success:false, message:"Server error"
//     })
//  }
// }



// //Toggle tracking active/inactive
// export const toggleTracking= async (req, res)=>{
//  try{
//     const trackiing = await KeywordTracking.findByIdAndDelete({_id:req.params.id, userId:req.userId}) 
//     if(!trackiing){
//         return res.status(404).json({
//             success:false, message:"keyword toggle not working"
//         })
//     } 
    
//     trackiing.active = !trackiing.active;
//     await trackiing.save()
//      res.json({
//         success:true, message:"Keyword tracking deleted"
//     })
//  }
//  catch(error){
//     console.error("Delete Keyword error:", error.message);
//     res.status(500).json({
//         success:false, message:"Server error"
//     })
//  }
// }
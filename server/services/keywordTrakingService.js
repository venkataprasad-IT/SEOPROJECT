import { rankTracker } from "./rankTrackerService.js";

export async function keywordTracking(tracking) {
    try {
        let result;

        // Try up to 2 times for reliability
        for (let attempt = 1; attempt <= 2; attempt++) {
            result = await rankTracker(
                tracking.keyword,
                tracking.domain
            );

            if (
                result.success &&
                result.data.totalResultsScanned > 0
            ) {
                break;
            }

            if (attempt < 2) {
                await new Promise((resolve) =>
                    setTimeout(
                        resolve,
                        result.success ? 3000 : 5000
                    )
                );
            }
        }

        if (result.success) {
            const prevPosition =
                tracking.currentPosition;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Update tracking data
            tracking.currentPosition =
                result.data.position;
            tracking.currentPage =
                result.data.page;
            tracking.competitors =
                result.data.competitors || [];
            tracking.lastChecked = new Date();
            tracking.status = "completed";

            // Position change
            tracking.positionChange =
                prevPosition &&
                result.data.position
                    ? prevPosition -
                      result.data.position
                    : 0;

            // Best position
            if (
                result.data.position &&
                (!tracking.bestPosition ||
                    result.data.position <
                        tracking.bestPosition)
            ) {
                tracking.bestPosition =
                    result.data.position;
            }

            // History entry
            const historyEntry = {
                date: today,
                position: result.data.position,
                page: result.data.page,
                title: result.data.title,
                snippet: result.data.snippet,
            };

            // Check if today's entry already exists
            const idx =
                tracking.rankHistory.findIndex(
                    (h) =>
                        new Date(
                            h.date
                        ).toDateString() ===
                        today.toDateString()
                );

            if (idx >= 0) {
                tracking.rankHistory[idx] =
                    historyEntry;
            } else {
                tracking.rankHistory.push(
                    historyEntry
                );
            }

            await tracking.save();

            return {
                success: true,
                tracking,
            };
        } else {
            tracking.status = "failed";
            tracking.lastChecked =
                new Date();

            await tracking.save();

            return {
                success: false,
                error:
                    result.error ||
                    "Rank tracking failed",
            };
        }
    } catch (error) {
        console.error(
            "Rank update error:",
            error.message
        );

        try {
            tracking.status = "failed";
            tracking.lastChecked =
                new Date();
            await tracking.save();
        } catch (saveError) {
            console.error(
                "Failed to save tracking status:",
                saveError.message
            );
        }

        return {
            success: false,
            error: error.message,
        };
    }
}
// import { rankTracker } from "./rankTrackerService.js";

// export async function  keywordTracking(params) {
//     try{
//         let result;

//         //Try up to 2 times for reliability....
//         for(let attempt=1; attempt<=2; attempt++){
//             result= await rankTracker(tracking.keyword, tracking.domain)
//             if(result.success && result.data.totalResultsScanned>0) break;
//             if(attempt<2) await new Promise((r)=> setTimeout(r, result.success ? 3000: 5000))
//         }

//         if(result.success){
//             const prev= tracking.currentPosition;
//             const today= new Date()
//             today.setHours(0,0,0,0);

//             tracking.currentPosition = result.data.position;
//             tracking.currentPage =result.data.page;
//             tracking.competitors = result.data.competitors;
//             tracking.lastChecked = new Date();
//             tracking.status = "completed";

//             //udate stats
//             tracking.positionChange = prev && result.data.position? - result.data.position: 0;
//             if(result.data.position && (!tracking.bestPosition || result.data.position <tracking.bestPosition)){
//                 tracking.bestPosition = result.data.position;
//             }


//             //Update history
//             const historyEntry ={
//                 date:today,
//                 position:result.data.position,
//                 page:result.data.page,
//                 title:result.data.title,
//                 snippet:result.data.snippet
//             }

//             const idx= tracking.rankHistory.findIndex((h)=>h.data.toDateString() === today.toDateString());

//             if(idx>=0) {
//                 tracking.rankHistory[idx] = historyEntry;
//             }else{
//                 tracking.rankHistory.push(historyEntry)
//             }
//         }else{

//         }
//     }
//     catch(errror){
//         console.error("Rank update error:", errror.message);
//         tracking.status ="failed";
//         await tracking.save().catch(()=>{});
//         return {
//             success:false,
//             errror:errror.message
//         }
//     }
// }
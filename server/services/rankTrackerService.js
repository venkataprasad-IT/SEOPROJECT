import { chromium } from "playwright-core";
import Browserbase from "@browserbasehq/sdk";

const bb = new Browserbase({
    apiKey: process.env.BROWSERBASE_API_KEY,
});

// Search Google for keyword and extract ranking
export async function rankTracker(keyword, targetDomain) {

    let browser;

    try {

        // Initialize Browserbase session
        const session = await bb.sessions.create({
            browserSettings: {
                blockAds: true
            }
        });

        browser = await chromium.connectOverCDP(session.connectUrl);

        const page = browser.contexts()[0].pages()[0];

        page.setDefaultNavigationTimeout(45000);

        // Visit Google
        await page.goto(
            "https://www.google.com",
            { waitUntil: "networkidle" }
        );

        // Consent handling
        try {
            const btn = await page.$(
                'button[id="L2AGLb"], form[action*="consent"] button'
            );

            if (btn) {
                await btn.click();
                await page.waitForTimeout(1500);
            }

        } catch { }

        let found = null;
        let allResults = [];

        const cleanTarget = targetDomain
            .replace("www.", "")
            .toLowerCase();

        // Scan first 5 pages
        for (let googlePage = 0; googlePage < 5; googlePage++) {

            await page.goto(
                `https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${googlePage * 10}&num=10&hl=en&gl=us`,
                { waitUntil: "networkidle" }
            );

            let pageResults = [];

            for (let retry = 0; retry < 3; retry++) {

                try {

                    await page.waitForSelector("h3", {
                        timeout: 8000
                    });

                    await page.waitForTimeout(1500);

                    pageResults = await page.evaluate(() => {

                        return Array.from(
                            document.querySelectorAll("h3")
                        )
                            .map((h3) => {

                                let a = h3.closest("a");

                                if (!a) {

                                    let p = h3.parentElement;

                                    for (
                                        let j = 0;
                                        j < 5 && p;
                                        j++, p = p.parentElement
                                    ) {

                                        if (p.tagName === "A") {
                                            a = p;
                                            break;
                                        }

                                        const sub =
                                            p.querySelector("a[href]");

                                        if (
                                            sub &&
                                            sub.contains(h3)
                                        ) {
                                            a = sub;
                                            break;
                                        }
                                    }
                                }

                                if (
                                    !a ||
                                    !a.href.startsWith("http") ||
                                    a.href.includes("google.")
                                ) {
                                    return null;
                                }

                                let snippet = "";

                                let c = a.parentElement;

                                for (
                                    let j = 0;
                                    j < 6 && c;
                                    j++, c = c.parentElement
                                ) {

                                    const txt =
                                        c.innerText || "";

                                    if (
                                        txt.length >
                                        h3.innerText.length + 50
                                    ) {

                                        snippet =
                                            txt
                                                .split("\n")
                                                .find(
                                                    line =>
                                                        line.length > 30 &&
                                                        !line.includes(
                                                            h3.innerText.substring(
                                                                0,
                                                                20
                                                            )
                                                        )
                                                ) || "";

                                        snippet =
                                            snippet
                                                .trim()
                                                .substring(0, 300);

                                        if (snippet)
                                            break;
                                    }
                                }

                                return {
                                    url: a.href,
                                    domain:
                                        new URL(
                                            a.href
                                        ).hostname.replace(
                                            "www.",
                                            ""
                                        ),
                                    title:
                                        h3.innerText.trim(),
                                    snippet
                                };

                            })
                            .filter(Boolean);

                    });

                    if (pageResults.length > 0)
                        break;

                    await page.reload({
                        waitUntil: "networkidle"
                    });

                }
                catch (error) {

                    if (retry === 2)
                        break;

                    await page.reload({
                        waitUntil: "networkidle"
                    });

                }
            }

            // Save results and check target ranking
            for (const r of pageResults) {

                r.position =
                    allResults.length + 1;

                allResults.push(r);

                if (
                    !found &&
                    (
                        r.domain
                            .toLowerCase()
                            .includes(cleanTarget)
                        ||
                        cleanTarget.includes(
                            r.domain.toLowerCase()
                        )
                    )
                ) {

                    found = {
                        ...r,
                        page: googlePage + 1
                    };
                }
            }

            if (found)
                break;

            await page.waitForTimeout(
                2000 +
                Math.random() * 2000
            );
        }

        await browser.close();

        const competitors =
            allResults
                .filter(
                    r =>
                        !r.domain
                            .toLowerCase()
                            .includes(cleanTarget)
                        &&
                        !cleanTarget.includes(
                            r.domain.toLowerCase()
                        )
                )
                .slice(0, 10);

        return {
            success: true,

            data: {
                keyword,
                targetDomain,

                position:
                    found?.position || null,

                page:
                    found?.page || null,

                title:
                    found?.title || "",

                snippet:
                    found?.snippet || "",

                competitors,

                totalResultsScanned:
                    allResults.length
            }
        };

    }
    catch (error) {

        console.error(
            "Rank check error:",
            error.message
        );

        if (browser) {
            await browser.close()
                .catch(() => { });
        }

        return {
            success: false,
            error: error.message
        };
    }
}


// import { chromium } from "playwright-core";
// import Browserbase from "@browserbasehq/sdk";

// const bb = new Browserbase({
//   apiKey: process.env.BROWSERBASE_API_KEY,
// });

// //search google for a keyword and extract ranking for a target domain

// export async function  rankTracker(keyword, targetDomain) {
//     let browser;

//     try{
//         //Initializze the borwser base & connect playwright
//         const session = await bb.sessions.create({
//             browserSettings:{blockAds:true}
//         });
//         browser = await chromium.connectOverCDP(session.connectUrl)
//         const page = browser.contexts()[0].pages()[0];
//         page.setDefaultNavigationTimeout(45000);


//         //Initial google visit & consent Handling...

//         await page.goto("https://www.google.com", {waitUntil: "networkidle"});
//         try{
//             const btn = await page.$('button[id="L2AGLb"], from[action*="consent"] button')
//             if(btn){
//                 await btn.click();
//                 await page.waitForTimeout(1500);
//             }
//         }catch{

//         }

//         let found= null,
//         allResults=[];

//         const cleanTarget = targetDomain.replace("www.","").toLowerCase();

//         //3. iterate upto five pages of google results...
//         for(let gPage=0; gPage<5; gPage++){
//             await gPage.goto(`https://www.google.com/search?q=${encodeURIComponent(keyword)}&start=${gPage*10}&num=10&hl=en&gl=ur`,{waitUntil:"networkidle"})

//             let pageResults =[];
//             for(let retry=0 ; retry<3; retry++){
//                 try{
//                     await page.waitForSelector('h3',{timeout:8000});
//                     await page.waitForTimeout(1500)

//                     pageResults = await page.evaluate(()=>Array.from(document.querySelectorAll("h3").map((h3)=>{
//                         let a= h3.closest('a');

//                         if(!a){
//                             let p = h3.parentElement;

//                             for(let j=0; j<5 && p; j++,p=p.parentElement){
//                                 if(p.tagName ==="A"){
//                                     a=p;
//                                     break;
//                                 }
//                                 const sub= p.querySelector("a[href]");
//                                 if(sub&& sub.contais(h3)){
//                                     a=sub;
//                                     break;
//                                 }
//                             }

//                             if(!a || !a.href.startsWith("http") || a.href.includes('google.')) return null;
//                             let s="";
//                             c= a.parentElement;

//                             for(let j=0; j<6 && j++ ; c=c.parentElement){
//                                 const txt= c.innerText || "";

//                                 if(txt.length> h3.innerText.length+50){
//                                     s= (txt.split("\n").find(1)=> l.length>30 &&
//                                      !l.includes(h3).innerText.substring(0,20)) || "" ).trim().substring(0,300)

//                                      if(s) break;
//                                 }
//                             }

//                             return {url:a.href , domain:new URL(a.href).hostname.replace("www.",""),
//                                 title:h3.innerText.trim(),, snippet:s
//                             }
//                         }
//                     }).filter(Boolean)) ;

//                     if(pageResults.length>0) break;
//                     await page.reload({waitUntil:"networkidle"})

//                 }catch(errror){
//                     if(retry === 2) break;
//                     await page.reload({
//                         waitUntil:"networkidle"
//                     })
//                 }
//             }


//             //5. Results Synthesis: Update global results and check for target match.
//             for(const r of pageResults){
//                 r.position = allResults.length+1;
//                 allResults.push(r)
//                 if(!found && (r.domain.toLowerCase().includes(clearTimeout) || cleanTarget.includes(r.domain.toLowerCase()))){
//                     found = {...r, page:gPage+1}
//                 }
//             }

//             if(found) break;
//             await page.waitForTimeout(2000+Math.random()*2000)
//         }


//         //6. Finalization: Close browser and extract competitors
//         await browser.close();
//         const competitors = allResults.filter((r)=> !r.domain.toLowerCase().includes(cleanTarget)
//         && !cleanTarget.includes(r.domain.toLowerCase())).slice(0,10);

//         return {
//             success:true,
//             data:{
//                 keyword,
//                 targetDomain,
//                 position:found?.position || null,
//                 page:found?.page || null,
//                 title:found?.title || "",
//                 snippet:found?.snippet || "",
//                 competitors,
//                 totalResultsScanned: allResults.length
//             }
//         }
//     }
//     catch(error){
//         console.error("Rank check error:", error.message);
//         if(browser){
//             await browser.close().catch(()=>{})
//             return {
//                 success:false,
//                 error:error.message
//             }
//         }
//     }
// } 
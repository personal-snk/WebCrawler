const axios = require('axios'); 
const playwright = require('playwright'); 
let scrollToBottom = require("scroll-to-bottomjs");


const args =  process.argv.slice(2);

const getHtmlPlaywright = async url => { 
	const browser = await playwright.chromium.launch(); 
	const context = await browser.newContext(); 
	const page = await context.newPage(); 
	await page.goto(url); 
    await page.evaluate(scrollToBottom);
	const html = await page.content(); 
	await browser.close(); 
	return html; 
};  

const depth = args[1]; 
const sourceURL = args[0] ? args[0]:'https://www.flipkart.com';
const URLsCrawled = []; 
const toBeCrawled = [];
const useHeadless = true; 
toBeCrawled.push(sourceURL);


const extractImages = (data,depth,sourceurl) =>{
    const imgRegex1 = /<img[^>]*src="([^"]+)"[^>]*>/g;
    const imgRegex2 =/url\(["']?([^"')]+)["']?\)/gi;
    let m,urls = [];

    while ( m = (imgRegex1.exec(data) || imgRegex2.exec(data))) {
        if(!m[1].includes("https"))
        {
            m[1] = 'https:'+m[1];
        }
        urls.push( {
            "imageUrl": m[1],
            "sourceUrl": sourceurl,
            "depth": depth-1
        } );
    }
    console.log("image Urls:",urls);
    return urls;
}

const extractLinks = (data) => {
    const linkRegex = /<a\s+(?:[^>]*?\s+)?href="(?!#)([^"]*)"/gi;
    let m,urls = [];
    while ( m = linkRegex.exec(data)) {
        urls.push(m[1] );
    }
    return urls;
}

const recExtractFunc = async (url,page) => { 
	URLsCrawled.push(url); 

	const data  = useHeadless ? await getHtmlPlaywright(url) : await getHtmlAxios(url);
	const content = extractImages(data,page,url); 
	const links = extractLinks(data,url); 
	links 
		.filter(link => !URLsCrawled.includes(link)) // Filter out already visited links 
		.forEach(link => toBeCrawled.push(link)); 
}; 

(async () => { 
	for (i=0;i<toBeCrawled.length;i++) { 
		if (URLsCrawled.length > depth) { 
			break; 
		} 
		let alreadyVisited = toBeCrawled.pop(); 
		await recExtractFunc(alreadyVisited,i+1); 
	} 
 
	console.log("Urls Crawled\n",URLsCrawled); 
	console.log("Urls to be Crawled\n",toBeCrawled); 
})();


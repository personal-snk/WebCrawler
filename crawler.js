const axios = require('axios'); 


const args =  process.argv.slice(2);

const depth = args[1]; 
const sourceURL = args[0] ? args[0]:'https://www.flipkart.com';
const URLsCrawled = []; 
const toBeCrawled = []; 
toBeCrawled.push(sourceURL);

const extractImages = (data,depth,sourceurl) =>{
    const imgRegex = /<img[^>]*src="([^"]+)"[^>]*>/g;
    let m,urls = [];
    while ( m = imgRegex.exec(data)) {
        urls.push( {
            "imageUrl": m[1],
            "sourceUrl": sourceurl,
            "depth": depth
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
	const { data } = await axios.get(url); 
	const content = extractImages(data,page,url); 
	const links = extractLinks(data,url); 
	links 
		.filter(link => !URLsCrawled.includes(link)) // Filter out already visited links 
		.forEach(link => toBeCrawled.push(link)); 
}; 

(async () => { 
	for (i=0;i<toBeCrawled.length;i++) { 
		if (URLsCrawled.length >= depth) { 
			break; 
		} 
		let alreadyVisited = toBeCrawled.pop(); 
		await recExtractFunc(alreadyVisited,i+1); 
	} 
 
	console.log("Urls Crawled\n",URLsCrawled); 
	console.log("Urls to be Crawled\n",toBeCrawled); 
})();



const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

let routeData = [];

async function run() {
	//First, we must launch a browser instance
	let s1 = "Dhaka", s2 = "Sylhet";
	// const browser = await puppeteer.launch({
	//     // Headless option allows us to disable visible GUI, so the browser runs in the "background"
	//     // for development lets keep this to true so we can see what's going on but in
	//     // on a server we must set this to true
	//     headless: false,
	//     // This setting allows us to scrape non-https websites easier
	//     ignoreHTTPSErrors: true,
	// })
	// // then we need to start a browser tab
	// let page = await browser.newPage();
	// // and tell it to go to some URL
	// await page.goto(`https://eticket.railway.gov.bd/booking/train/search?fromcity=${s1}&tocity=${s2}&doj=13-Aug-2022&class=F_CHAIR`);
	// await page.waitForSelector('div.single-seat-class')
	// // print html content of the website
	// let bogies = await (await page.$$('div.single-seat-class'));
	// for (bogie of bogies) {
	// let dataObj = JSON.parse(await bogie.evaluate(node => node.getAttribute("data-seat-type")));
	// console.log(dataObj);
	const cheerioRes = await fetch("https://eticket.railway.gov.bd/booking/trip/8100058/41273658/seat-selection/MzU1Mg==", {
		"headers": {
			"accept": "*/*",
			"accept-language": "en-US,en;q=0.9,bn-BD;q=0.8,bn;q=0.7,hi-IN;q=0.6,hi;q=0.5,ru-RU;q=0.4,ru;q=0.3",
			"content-type": "application/x-www-form-urlencoded; charset=UTF-8",
			"sec-ch-ua": "\".Not/A)Brand\";v=\"99\", \"Google Chrome\";v=\"103\", \"Chromium\";v=\"103\"",
			"sec-ch-ua-mobile": "?0",
			"sec-ch-ua-platform": "\"Linux\"",
			"sec-fetch-dest": "empty",
			"sec-fetch-mode": "cors",
			"sec-fetch-site": "same-origin",
			"x-requested-with": "XMLHttpRequest",
			"cookie": "_ga=GA1.1.1037066978.1631364817; _ga_XL3REV1DHW=GS1.1.1631364816.1.1.1631365450.0; twk_uuid_578b3556c9a9fefa7910bca3=%7B%22uuid%22%3A%221.4gktxLbiIrUxsUolTC9BjZjXm3QNJG6ixs57xh4K8pq8fWBtew9FRrS55xh3lmKkyIq4dmZpzy2q6guPxknOoPvJQamum9ezstMOVHKqYkYtzMWkjjntm4HOakmg0CoFqBUtiB9DHajElSfI4J1%22%2C%22version%22%3A3%2C%22domain%22%3A%22railway.gov.bd%22%2C%22ts%22%3A1649741840662%7D; remember_a811ef1499320b1567ca0eb524a3f72f=eyJpdiI6Im5ZTEtwT2ppK2JjVnJIS3VPQUx2VDU1XC9HZTBubnVPdDN1a05ObmZ0cnBZPSIsInZhbHVlIjoiZEZSVkFBSnRrT0xqRUlMTmorMmtOMjFaakZpS2Z0SHZWaE1SeU5hamdoUUNDNVRqZUlKZ2xpc01RamxZaFZON0Y1dkx2YlpHWlQ1QlwvbldVRXpFVGFiU1E2cm56XC9QVFwvTGZDcnJ0ZXpjZFRvd1M5NEJ2U3NsXC9UMk1wRmIwR2xqIiwibWFjIjoiMmZlMDc4MzBiOTNlMmU5NTQ2NjMxZmI1MmYyN2I3ZGI0OTZhMjdlMjFmYzZjZTc3NDNlZWIyZjIwZWYwZTg3YiJ9; WZRK_S_485-K65-RR5Z=%7B%22p%22%3A3%7D; wwwu=eyJpdiI6IitSbGJxUnliY0E2YWpyMUxJSWh2eENsZW1GQmhneW4yWjVIZUtsZFBWeHM9IiwidmFsdWUiOiIzZ0lES3N3YllsY1VkRHN6OTFHU21zeEpMM1JlUGE4TWY0YytXck9BamlVMjlKdjdnSkR6SXhaT1BrcmtKZ1MxTjBuWmptWmk3Qlpmak1rRmxwWGpiQT09IiwibWFjIjoiZDNhYTQwNzVlY2YxMDZiZWQ3OTVmOTI4YjhkMTJmNDIwZDZiZjA4NzJlMDQ1MWJmZmIxN2FkNmU4NDcwOTliMiJ9; laravel_session=eyJpdiI6IlVHUUdjY0xrNXJQN3lNWEhFVDJBNHBNbHZlUGg4dG1HdE5xTjJvYnorMEU9IiwidmFsdWUiOiJTbHNjSVBrWWE3RVlmYjdISW9QcmhyQkxKXC9UVjkwTjBXXC9sTnVtbExCUlRuKzNuTjlPR1pLelEyKzI5WlRaY1wvOEVLZk9yT2h4dzZyVFwvK1ZKZythREE9PSIsIm1hYyI6IjY3MTZkODAzYTg4ZTE5OTQyNmNhZWY5ZjgwOGZhNGZhOWMyZGY4M2QzZjNhMjFmODljOWZhOTRjYTBlYjA4YWEifQ%3D%3D",
			"Referer": "https://eticket.railway.gov.bd/booking/train/search?fromcity=Dhaka&tocity=Mohanganj&doj=12-Aug-2022&class=SNIGDHA",
			"Referrer-Policy": "strict-origin-when-cross-origin"
		},
		"body": "trip=onward",
		"method": "POST"
	});

	const cheerioBody = await cheerioRes.text();

	let seats = []

	const $ = cheerio.load(cheerioBody);
	$('.seat_layout').children().each((id, ul) => {
		$(ul).children().each((id, li) => {
			seats.push(JSON.parse($(li).attr('data-seat')));
		});
	});
	console.log(seats);

	routeData.push({ ...dataObj, seats: seats })
	// }


	// fs.writeFileSync("routedata.json", JSON.stringify(routeData));
	//console.log(routeData);
	// close everything
	// await page.close();
	// await browser.close();

}





run();
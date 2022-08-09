
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

let routeData = [];
let bogeys = [];

const { Pool, Client } = require('pg')

const dbclient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'railbuddy',
  password: 'bogmbogm2',
  port: 5432,
});

dbclient.connect();

async function run() {
	//First, we must launch a browser instance
	// let s1="Dhaka", s2="Sylhet";
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
	// let bogeys = await (await page.$$('div.single-seat-class'));

	

	for (bogey of bogeys) {
		console.log(bogey);
		const cheerioRes = await fetch(`https://eticket.railway.gov.bd/booking/trip/${bogey.trip_id}/${bogey.trip_route_id}/seat-selection/ODMxNQ==`, {
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
				"cookie": "_ga=GA1.1.1037066978.1631364817; _ga_XL3REV1DHW=GS1.1.1631364816.1.1.1631365450.0; twk_uuid_578b3556c9a9fefa7910bca3=%7B%22uuid%22%3A%221.4gktxLbiIrUxsUolTC9BjZjXm3QNJG6ixs57xh4K8pq8fWBtew9FRrS55xh3lmKkyIq4dmZpzy2q6guPxknOoPvJQamum9ezstMOVHKqYkYtzMWkjjntm4HOakmg0CoFqBUtiB9DHajElSfI4J1%22%2C%22version%22%3A3%2C%22domain%22%3A%22railway.gov.bd%22%2C%22ts%22%3A1649741840662%7D; remember_a811ef1499320b1567ca0eb524a3f72f=eyJpdiI6ImdzK1NaWHFZQ1dUZG9nOXFIZ1pYR2xQVEttVmowd2VkWXREUHFiSjFGbEk9IiwidmFsdWUiOiJGMHBxWjlBcTNnRHBcL3VJZUc2SHdNRFZYQXQ3bVVvTVF4U2ROUWhYZWFJVG42YlJvaU1CS0l3eGxwNGgrTUMyMk1oUVlHME9TMGU5K251NHNJUlwvTWoyNGxMc1NPWFZRY213XC9qM0MyWG56SDhWUW5XVFFGXC9NZ3MraGtUQXpWdkoiLCJtYWMiOiIzMDBkNjk2MGM1NmI3YjJmMzgxMzY1ZjllZTI4ZDhjZjEwMTNkYTRiNTJiZjY4OTIzNWVlMDQyYzc4MjhhZWE5In0%3D; WZRK_S_485-K65-RR5Z=%7B%22p%22%3A11%7D; wwwu=eyJpdiI6ImZOWGlFYUcrdXBTeTFLc21IajBSRVdiZDZBT0JBdjVDYkdJWFZHamxTeUk9IiwidmFsdWUiOiJja1hKTHZ0c2ZJUXVCaUVXcmExXC9INlpnbHc4WHZWeWNRNHhodmRHRSs5SmlkRTZvQkdwRzhNeFV4cFlSNGV0VkJvWFJlME1wXC83bHpFWTcrZkpKR2lRPT0iLCJtYWMiOiJmZTk2OWIxNGY4ZWE1NDRlZmQxZWFkMjI0NjIxOWQ1MDJiMjQ2MmRjZjBkYzE4ODRhNTgzNzBlZWYzZmJmYTZjIn0%3D; laravel_session=eyJpdiI6Im1DU0s4YXhnOHh1T3pVYkZWZXpUVzR6KzZ5bGx3Q00ydW42dnVmb2dXMXc9IiwidmFsdWUiOiJ2Y2NyQitVRUxzRENjcXBYeEJtODQ5blBMblNDREFVMWY4NVp6TnFGVk1QQ0tldllLb1ZqdjZ3M3dDbFRPWm52bElFRCtDYzh2ZGRzQnFRbkxFXC83anc9PSIsIm1hYyI6IjcyNTg1NmU2MmIzYjM0NzRjZDk2NjBlYjk0NGY2ZmRmZTQyZjViYjYxYzMzZWJiMzk0M2Y1NTAzOWQyYjRmMzUifQ%3D%3D",
				"Referer": `https://eticket.railway.gov.bd/booking/train/search`,
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

		routeData.push ({...bogey, seats: seats})
	}


	fs.writeFileSync("routedata.json", JSON.stringify(routeData));
	//console.log(routeData);
	// close everything
	// await page.close();
	// await browser.close();

}


dbclient.query("select distinct on (train_id, get_train_name(train_id), type, fare) train_id, get_train_name(train_id), type, fare, trip_id, trip_route_id from covering_pairs;").then(qres => {
    bogeys = [...qres.rows];
    console.log(bogeys);
    run();
}).catch(e => console.error(e.stack));


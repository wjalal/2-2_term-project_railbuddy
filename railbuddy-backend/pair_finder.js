
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');

let routeData = [];

const { Pool, Client } = require('pg')

const dbclient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'railbuddy',
  password: 'bogmbogm2',
  port: 5432,
});

dbclient.connect();

let pairs = [];

async function run() {
	//First, we must launch a browser instance
	const browser = await puppeteer.launch({
	    // Headless option allows us to disable visible GUI, so the browser runs in the "background"
	    // for development lets keep this to true so we can see what's going on but in
	    // on a server we must set this to true
	    headless: false,
	    // This setting allows us to scrape non-https websites easier
	    ignoreHTTPSErrors: true,
	})
	// then we need to start a browser tab
	let page = await browser.newPage();
	// and tell it to go to some URL
    for (let ijs=9; ijs<=13; ijs++) {
        for (pair of pairs) {
            console.log(pair);
            await page.goto(`https://eticket.railway.gov.bd/booking/train/search?fromcity=${pair.s1}&tocity=${pair.s2}&doj=${ijs}-Aug-2022&class=F_CHAIR`);
            //await page.waitForSelector('div.single-seat-class', "span.no-ticket-found-first-msg");
            // print html content of the website
            let tryBogies = false;
            await Promise.race([
                page.waitForSelector('div.single-seat-class')
                .then(() => tryBogies = true)
                .catch(),
                page.waitForSelector('.no-ticket-found-first-msg')
                .catch(),
            ]);

            // await un.focus();

            if (tryBogies) {
                let bogies = await page.$$('div.single-seat-class');
                for (bogie of bogies) {
                    // let gp = await bogie.$('xpath=../..');
                    // let gpsib = await gp.$$('xpath=following-sibling::*');
                    const parentElement = await bogie.evaluateHandle(
                        (element) => element?.parentElement?.parentElement?.previousElementSibling?.firstElementChild,
                    );
                    let tid = await parentElement.evaluate( node => node.innerText );
                    tid = tid.substring (tid.indexOf('(') + 1, tid.indexOf(')'));
                    console.log(tid);
                    let dataObj = JSON.parse(await bogie.evaluate( node => node.getAttribute("data-seat-type")));
                    console.log(dataObj);
                    dbclient.query("insert into covering_pairs(train_id, trip_id, trip_route_id, route_id, fare, type) values ($1, $2, $3, $4, $5, $6)", 
                    [tid, dataObj.trip_id, dataObj.trip_route_id, dataObj.route_id, dataObj.fare, dataObj.type]).then(qres => {
                    }).catch(e => console.error(e.stack));
                };
            };
        };
    };
};

dbclient.query("select distinct id, get_station_name(origin) as s1, get_station_name(dest) as s2 from train").then(qres => {
    pairs = [...qres.rows];
    console.log(pairs);
    run();
}).catch(e => console.error(e.stack));


const fs = require('fs');

let seatData = [];

fs.readFile('routedata.json', (err, data) => {
    if (err) throw err;
    seatData = JSON.parse(data);
    console.log(seatData);
});
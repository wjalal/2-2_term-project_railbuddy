const fs = require('fs');

let seatData = [];

const { Pool, Client } = require('pg');
const { exit } = require('process');

function pad(num, size) {
    //num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
};

const dbclient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'railbuddy',
  password: 'bogmbogm2',
  port: 5432,
});

dbclient.connect();

fs.readFile('routedata.json', (err, data) => {
    if (err) throw err;
    seatData = JSON.parse(data);
    for (bogey of seatData) {
        //console.log(bogey.seats);
        //process.stdout.write(`${bogey.trip_route_id}\n\n`);
        let seatmatrix = {
            KA: new Array(30),
            KHA: new Array(30),
            GA: new Array(30),
            GHA: new Array(30),
            UMA: new Array(30),
            CHA: new Array(30),
            SCHA: new Array(30),
            JA: new Array(30),
            JHA: new Array(30),
            NEO: new Array(30),
            TA: new Array(30),
            THA: new Array(30),
            DA: new Array(30),
            DHA: new Array(30),
            DANT: new Array(30),
            TO: new Array(30),
            THO: new Array(30),
            DOA: new Array(30),
            XTR: new Array(30),
            XTR1: new Array(30),
            XTR2: new Array(30),
            XTR3: new Array(30),
            XTR4: new Array(30),
            XTR5: new Array(30),
            XTR8: new Array(30),
            SLR: new Array(30),
        };
        Object.keys(seatmatrix).forEach(key => {
            for (let i=0; i<seatmatrix[key].length; i++) {
                seatmatrix[key][i] = new Array(7);
            };
        });
        

        for (seat of bogey.seats) {
            //console.log(seat.floor_name + "\n\n\n");
            if (seat.floor_name && seat.seat_row && seat.seat_column) {
                if (seat.seat_number === '') (seatmatrix[seat.floor_name])[seat.seat_row-1][seat.seat_column-1] = '000 ';
                else (seatmatrix[seat.floor_name])[seat.seat_row-1][seat.seat_column-1] = pad(seat.seat_number.substring(seat.seat_number.indexOf('-')+1, seat.seat_number.length), 3) + ' ';
            };
        };
        
        Object.keys(seatmatrix).forEach(key => {
            var ucount = 0;
            for (let i=0; i<seatmatrix[key].length; i++) 
                for (let j=0; j<seatmatrix[key][i].length; j++) 
                    if (seatmatrix[key][i][j] === undefined)
                        ucount++;
            if (ucount < 210) {
                process.stdout.write(`${bogey.trip_route_id}  ${key}\n\n`);
                for (let i=0; i<seatmatrix[key].length; i++) {
                    for (let j=0; j<seatmatrix[key][i].length; j++) {
                        if (seatmatrix[key][i][j] === undefined) process.stdout.write(" ");
                        else process.stdout.write(seatmatrix[key][i][j]);
                    };
                    process.stdout.write("\n");
                };
                process.stdout.write("\n");
                process.stdout.write("\n");
            };
        });
        process.stdout.write("\n");
        //console.log(seatmatrix);
        
    };
    exit(0);

});




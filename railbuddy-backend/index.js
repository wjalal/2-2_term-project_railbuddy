const express = require('express');
const session = require('express-session');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 80;
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const otpGenerator = require('otp-generator');
const axios = require('axios');

app.use(bodyParser.json());
app.use(cookieParser());

app.enable('trust proxy');
// app.use(cors());
app.use(cors({
    origin: 'http://localhost:5173',
    // methods: ['POST', 'PUT', 'GET', 'OPTIONS', 'HEAD'],
    credentials: true
}));
// app.options('*', cors({
//     origin: true,
//     credentials: true
// }));

// app.use((req, res) => {  
//     res.header('Access-Control-Allow-Credentials', true);
//     res.header('Access-Control-Allow-Origin', 'https://mcve.glitch.me'); // only_one_url_here');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, POST, GET, OPTIONS, DELETE');
// });  



app.use(session({
    secret: 'এইটো হৈছে ৰেলৱে ৱেবছাইটৰ সুৰক্ষা নিশ্চিত কৰিবলৈ ডাঙৰ এক্সপ্রেছ চেছনৰ ডাঙৰ অসমীয়া চিক্রেট',
    resave: false,
    saveUninitialized: true,
    sameSite: 'none',
    cookie: {
        // path: ['/api/login', '/api/getProfile'],
        maxAge: 30*60*1000,
        httpOnly: false
    }
}));



const { Pool, Client } = require('pg')

const dbclient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'railbuddy',
  password: 'bogmbogm2',
  port: 5432,
});

dbclient.connect();

// dbclient.query(
//     `SELECT COUNT(*) FROM customer WHERE mobile='556'`
// ).then(qres => {
//     console.log(qres.rows[0].count);
    
// }).catch(e => console.error(e.stack));

app.post('/api/login', (req, res) => {
    console.log(req.body);

    dbclient.query(
        `SELECT name FROM customer WHERE mobile=$1 AND password=$2`,
        [req.body.mobile, req.body.password]
    ).then(qres => {
        //console.log(qres);
        if (qres.rows.length === 0) res.send({ 
            success: false,
            name: null
        });
        else {
            req.session.userid = req.body.mobile;
            res.send({
                success: true,
                name: qres.rows[0].name
            });
            console.log(req.session);
        };
    }).catch(e => console.error(e.stack));
});

app.post('/api/sendOTP', (req, res) => {
    let available = false;
    dbclient.query (
        `SELECT COUNT(*) FROM customer WHERE mobile=$1`,
        [req.body.mobile]
    ).then(qres => {
        if (qres.rows[0].count === '0') {
            dbclient.query (
                "SELECT UPSERT($2, $1)",
                [otpGenerator.generate(6, {
                    upperCaseAlphabets: false,
                    lowerCaseAlphabets: false,
                    specialChars: false
                }), req.body.mobile]
            ).then(qres2 => {
                res.send(true);
            }).catch(e => console.error(e.stack));
        } else res.send(false);
    }).catch(e => console.error(e.stack));
});

app.post('/api/checkOTP', (req, res) => {
    dbclient.query (
        `SELECT otp FROM otp WHERE mobile=$1`,
        [req.body.mobile]
    ).then (qres => {
        if (qres.rows[0].otp === req.body.otp) res.send(true);
        else res.send("Invalid OTP!");
    }).catch(e => console.error(e.stack));
});

app.post('/api/checkNID', (req, res) => {
    dbclient.query (
        `SELECT COUNT(*) FROM customer WHERE nid=$1`,
        [req.body.nid]
    ).then(qres => {
        if (qres.rows[0].count === '0') {
            axios.post("http://localhost:6969/api", {
				nid: req.body.nid,
				dob: req.body.dob
			}).then (res2 => {
				console.log(res2.data);
				if (res2.data === false) {
					res.send (false)
				} else res.send (res2.data); 
			}).catch (err => {
				console.log(err);
			});
        } else res.send (true);
    }).catch(e => console.error(e.stack));
});

app.post('/api/register', (req, res) => {
    console.log(req.body);
    dbclient.query (
        "INSERT INTO customer(mobile, password, nid, dob, name, address) values($1, $2, $3, $4, $5, $6)",
        [req.body.mobile, req.body.password, req.body.nid, req.body.dob, req.body.name, req.body.address]
    ).then(qres => {
        console.log(qres);
        if (qres.rowCount === 1) res.send(true);
        else if (qres.rowCount === 0) res.send(false);
    }).catch(e => {
        console.error(e.stack);
        res.send(false);
    });
});

app.post('/api/logout',(req,res) => {
    req.session.destroy();
    res.send({
        success: true
    });
});

app.post('/api/getProfile', (req, res) => {
    console.log(req.session);
    if (req.session.userid) {
        dbclient.query(
            "SELECT mobile, nid, dob, name, address, (pref).locale, (pref).pay_method, (pref).pay_acc FROM customer WHERE mobile=$1", 
            [req.session.userid]
        ).then(qres => {
            //console.log(qres);
            if (qres.rows.length === 0) res.send({ 
                success: false,
            });
            else {
                res.send({
                    ...qres.rows[0],
                    success: true,
                });
            };
        }).catch(e => console.error(e.stack));
    };
});

app.post('/api/updateUser', (req,res) => {
    let attr = req.body.attr;
    if (req.session.userid === req.body.mobile) {
        if (attr==='address' || attr==='locale' || attr==='pay_method' || attr==='pay_acc') {
            if (attr != "address") attr = `pref.${attr}`; 
            dbclient.query(
                `UPDATE customer SET ${attr}=$1 WHERE mobile=$2`, 
                [req.body.value, req.body.mobile]
            ).then(qres => {
                //console.log(qres);
                if (qres.rowCount === 1) res.send({ 
                    success: true,
                });
                else if (qres.rowCount === 0) {
                    res.send({
                        success: false,
                    });
                };
            }).catch(e => console.error(e.stack));
        };
    };
});

app.post('/api/updatePassword', (req,res) => {
    dbclient.query(
        `UPDATE customer SET password=$1 WHERE mobile=$2 AND password=$3`, 
        [req.body.password, req.session.userid, req.body.password0]
    ).then(qres => {
        //console.log(qres);
        if (qres.rowCount === 1) res.send({ 
            success: true,
        });
        else if (qres.rowCount === 0) {
            res.send({
                success: false,
            });
        };
    }).catch(e => console.error(e.stack));
});

app.post('/api/getStations', (req,res) => {
    dbclient.query("SELECT id, name, district FROM station WHERE id < 900").then(qres => {
        res.send(qres.rows);
    }).catch(e => console.error(e.stack));
});

app.post('/api/getClasses', (req,res) => {
    dbclient.query("SELECT unnest(enum_range(NULL::seat_class));").then(qres => {
        let nameArr = [];
        qres.rows.forEach(obj => { nameArr.push(obj.unnest) });
        res.send(nameArr);
        console.log(nameArr);
    }).catch(e => console.error(e.stack));
});

app.use(express.static(path.resolve(__dirname, '../railbuddy-client/dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../railbuddy-client/dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
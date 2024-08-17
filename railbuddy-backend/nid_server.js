const express = require('express');
const cors = require('cors');
const app = express();
const port = 6969;
const bodyParser = require('body-parser');


app.use(bodyParser.json());
app.use(cors());

const { Pool, Client } = require('pg')

const dbclient = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'bd_nid',
  password: 'bogmbogm2',
  port: 5432,
});

dbclient.connect();

// dbclient.query(
//     `SELECT COUNT(*) FROM customer WHERE mobile='556'`
// ).then(qres => {
//     console.log(qres.rows[0].count);
    
// }).catch(e => console.error(e.stack));


app.post('/api', (req, res) => {
    dbclient.query (
        `SELECT name, address FROM nid_data WHERE nid=$1 AND dob=$2`,
        [req.body.nid, req.body.dob]
    ).then (qres => {
        if (qres.rows.length === 0) res.send(false);
        else res.send (qres.rows[0]);
    }).catch(e => console.error(e.stack));
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
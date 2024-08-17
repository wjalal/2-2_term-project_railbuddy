const express = require("express");
const session = require("express-session");
const path = require("path");
// const cors = require('cors');
const app = express();
const port = 6969;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
// const axios = require('axios');
const crypto = require("crypto");
const dotenv = require("dotenv");
// const url = require('url')
// const { v4: uuidv4 } = require('uuid');
const fs = require("fs").promises;
const multer = require("multer");
const { Readable } = require("stream");
const excelReader = require("xlsx");

dotenv.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.enable("trust proxy");
// app.use(cors());
// app.use(cors({
//    origin: 'http://localhost:5173',
//    credentials: true
// }));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    sameSite: "none",
    cookie: {
      maxAge: 60 * 60 * 1000 * 24 * 30,
      httpOnly: true,
    },
  }),
);

const { Pool, Client } = require("pg");
const e = require("express");

const dbclient = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

dbclient.connect();

const getRealISODate = () => {
  return new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .substring(0, 10);
};

app.post("/api/getSession", (req, res) => {
  if (req.session.userid) {
    dbclient
      .query(`SELECT name, userid, type FROM user_account WHERE userid=$1`, [
        req.session.userid,
      ])
      .then((qres) => {
        res.send({
          success: true,
          userid: qres.rows[0].userid,
          name: qres.rows[0].name,
          type: qres.rows[0].type,
        });
      })
      .catch((e) => {
        req.session.destroy();
        res.send({
          success: false,
        });
        console.error(e.stack);
      });
  } else {
    res.send({
      success: false,
    });
  }
});

app.post("/api/login", (req, res) => {
  console.log(req.body);

  dbclient
    .query(`SELECT name FROM user_account WHERE userid=$1 AND password=$2`, [
      req.body.userid,
      req.body.password,
    ])
    .then((qres) => {
      //console.log(qres);
      if (qres.rows.length === 0)
        res.send({
          success: false,
          name: null,
        });
      else {
        req.session.userid = req.body.userid;
        res.send({
          success: true,
          name: qres.rows[0].name,
          type: qres.rows[0].type,
        });
        console.log(req.session);
      }
    })
    .catch((e) => console.error(e.stack));
});

app.post("/api/logout", (req, res) => {
  req.session.destroy();
  res.send({
    success: true,
  });
});

// app.post('/api/getProfile', (req, res) => {
//     console.log(req.session);
//     if (req.session.userid) {
//         dbclient.query(
//             "SELECT mobile, nid, dob, name, address, (pref).locale, (pref).pay_method, (pref).pay_acc FROM customer WHERE mobile=$1",
//             [req.session.userid]
//         ).then(qres => {
//             //console.log(qres);
//             if (qres.rows.length === 0) res.send({
//                 success: false,
//             });
//             else {
//                 res.send({
//                     ...qres.rows[0],
//                     success: true,
//                 });
//             };
//         }).catch(e => console.error(e.stack));
//     };
// });

// app.post('/api/getSelfID', (req, res) => {
//     console.log(req.session);
//     if (req.session.userid) {
//         dbclient.query(
//             "SELECT nid, name FROM customer WHERE mobile=$1",
//             [req.session.userid]
//         ).then(qres => {
//             //console.log(qres);
//             if (qres.rows.length === 0) res.send({
//                 success: false,
//             });
//             else {
//                 res.send({
//                     ...qres.rows[0],
//                     success: true,
//                 });
//             };
//         }).catch(e => console.error(e.stack));
//     };
// });

// app.post('/api/updateUser', (req,res) => {
//     let attr = req.body.attr;
//     if (req.session.userid === req.body.mobile) {
//         if (attr==='address' || attr==='locale' || attr==='pay_method' || attr==='pay_acc') {
//             if (attr != "address") attr = `pref.${attr}`;
//             dbclient.query(
//                 `UPDATE customer SET ${attr}=$1 WHERE mobile=$2`,
//                 [req.body.value, req.body.mobile]
//             ).then(qres => {
//                 //console.log(qres);
//                 if (qres.rowCount === 1) res.send({
//                     success: true,
//                 });
//                 else if (qres.rowCount === 0) {
//                     res.send({
//                         success: false,
//                     });
//                 };
//             }).catch(e => console.error(e.stack));
//         };
//     };
// });

// app.post('/api/updatePassword', (req,res) => {
//     dbclient.query(
//         `UPDATE customer SET password=$1 WHERE mobile=$2 AND password=$3`,
//         [req.body.password, req.session.userid, req.body.password0]
//     ).then(qres => {
//         //console.log(qres);
//         if (qres.rowCount === 1) res.send({
//             success: true,
//         });
//         else if (qres.rowCount === 0) {
//             res.send({
//                 success: false,
//             });
//         };
//     }).catch(e => console.error(e.stack));
// });

app.post("/api/getStations", (req, res) => {
  dbclient
    .query(
      "SELECT id, name, district, coords FROM station WHERE id < 900 ORDER BY district ASC, name ASC",
    )
    .then((qres) => {
      res.send(qres.rows);
    })
    .catch((e) => console.error(e.stack));
});

app.post("/api/getReportStatus", (req, res) => {
  if (req.session.userid) {
    dbclient
      .query("SELECT last_report FROM user_account WHERE userid=$1", [
        req.session.userid,
      ])
      .then((qres) => {
        console.log(qres);
        if (qres.rows[0].last_report == null) {
          res.send({
            success: true,
            state: "NO_UPLOADS",
          });
        }
      });
  } else {
    res.send({
      success: false,
    });
  }
});

app.post("/api/getCompTypes", (req, res) => {
  dbclient
    .query("SELECT unnest(enum_range(NULL::complaint_category));")
    .then((qres) => {
      let nameArr = [];
      qres.rows.forEach((obj) => {
        nameArr.push(obj.unnest);
      });
      res.send(nameArr);
    })
    .catch((e) => console.error(e.stack));
});

app.post("/api/uploadFile", multer().single("doc"), (req, res) => {
  // console.log(req.body);
  // fs.writeFileSync("src/" + req.file.originalname, req.file.buffer);
  if (req.session.userid) {
    dbclient
      .query(
        `insert into report (owner, original_filename) values ($1, $2) returning id;`,
        [req.session.userid, req.file.originalname],
      )
      .then(async (qres) => {
        console.log(qres);
        if (qres.rowCount === 1) {
          await fs.writeFile("uploads/" + qres.rows[0].id, req.file.buffer);
          const temp = `This page is the ghost of a now irrelevant feature. <br>
                There is no preview. <br>
                Just click the confirm button above if you have reached this page. <br>`;
          //console.log(temp);
          res.send({
            success: true,
            preview: temp,
            file_id: qres.rows[0].id,
          });
        } else if (qres.rowCount === 0) {
          res.send({
            success: false,
          });
        }
      })
      .catch((e) => console.error(e.stack));
    console.log(req.body);
    console.log(req.file);
  } else
    res.send({
      success: false,
    });
});

app.post("/api/confirmFileUpload", (req, res) => {
  if (req.session.userid) {
    if (req.body.confirm == true)
      dbclient
        .query(
          `update report set upload_confirmed=true where owner=$1 and id=$2`,
          [req.session.userid, req.body.file_id],
        )
        .then((qres) => {
          console.log(qres);
          if (qres.rowCount === 1) {
            res.send({
              success: true,
            });
          } else if (qres.rowCount === 0) {
            res.send({
              success: false,
            });
          }
        })
        .catch((e) => console.error(e.stack));
    else if (req.body.confirm == false)
      dbclient
        .query(`delete from report where owner=$1 and id=$2`, [
          req.session.userid,
          req.body.file_id,
        ])
        .then((qres) => {
          console.log(qres);
          if (qres.rowCount === 1) {
            res.send({
              success: true,
            });
          } else if (qres.rowCount === 0) {
            res.send({
              success: false,
            });
          }
        })
        .catch((e) => console.error(e.stack));
    else
      res.send({
        success: false,
      });
  } else
    res.send({
      success: false,
    });
});

app.post("/api/getReportList", (req, res) => {
  console.log(req.session);
  if (req.session.userid == "ADMIN") {
    dbclient
      .query(`select * from report where order by last_upload_timestamp desc`)
      .then((qres) => {
        //console.log(qres);
        if (qres.rows.length === 0)
          res.send({
            success: false,
          });
        else {
          res.send({
            history: [...qres.rows],
            success: true,
          });
        }
      })
      .catch((e) => console.error(e.stack));
  } else if (req.session.userid) {
    dbclient
      .query(
        `select * from report where owner = $1 order by last_upload_timestamp desc`,
        [req.session.userid],
      )
      .then((qres) => {
        //console.log(qres);
        if (qres.rows.length === 0)
          res.send({
            success: false,
          });
        else {
          res.send({
            history: [...qres.rows],
            success: true,
          });
        }
      })
      .catch((e) => console.error(e.stack));
  }
});

app.post("/api/getContactList", (req, res) => {
  console.log(req.session);
  if (req.session.userid) {
    dbclient
      .query(
        `select user1, user2,
                case
                    when user1=$1 then (seen1-seen2)
                    else (seen2-seen1)
                end as sdiff,
                case
                    when user1=$1 then (select name from user_account where userid=user2)
                    else (select name from user_account where userid=user1)
                end as cname
            from contact
            where user1=$1 or user2=$1
            order by last_time desc`,
        [req.session.userid],
      )
      .then((qres) => {
        //console.log(qres);
        contactList = [];
        qres.rows.forEach((c) => {
          if (c.user1 == req.session.userid) {
            contactList.push({
              cid: c.user2,
              cname: c.cname,
              sdiff: c.sdiff,
            });
          } else if (c.user2 == req.session.userid) {
            contactList.push({
              cid: c.user1,
              cname: c.cname,
              sdiff: c.sdiff,
            });
          }
        });
        res.send(contactList);
      })
      .catch((e) => console.error(e.stack));
  }
});

app.post("/api/addContact", async (req, res) => {
  console.log(req.body);
  if (req.session.userid && req.session.userid != req.body.userid) {
    try {
      let qres = await dbclient.query(
        `select name from user_account where userid=$1 and (type='client' or type='group')`,
        [req.body.userid],
      );
      if (qres.rows.length > 0) {
        let qres2 = await dbclient.query(
          `select serial from contact where (user1=$1 and user2=$2) or (user1=$2 and user2=$1)`,
          [req.session.userid, req.body.userid],
        );
        if (qres2.rows.length > 0) {
          res.send({
            success: false,
            invalid: false,
            preexist: true,
          });
        } else {
          let qres3 = await dbclient.query(
            `insert into contact (user1, user2) values ($1, $2)`,
            [req.session.userid, req.body.userid],
          );
          if (qres3.rowCount === 1)
            res.send({
              success: true,
            });
        }
      } else
        res.send({
          success: false,
          invalid: true,
        });
    } catch (e) {
      console.log(e);
    }
  } else
    res.send({
      success: false,
    });
});

app.post("/api/sendMessage", async (req, res) => {
  console.log("message for " + req.body);
  if (req.session.userid) {
    dbclient
      .query(
        `insert into message (sender, recip, timestamp, text)
            values ($1, $2, current_timestamp, $3)`,
        [req.session.userid, req.body.recip, req.body.text],
      )
      .then((qres) => {
        //console.log(qres);
        if (qres.rowCount === 1) {
          if (req.body.recip.substring(0, 5) == "group") {
            dbclient
              .query(
                `update contact set last_time = current_timestamp
                        where user1=$1 or user2=$1`,
                [req.body.recip],
              )
              .then((qres2) => {
                //console.log(qres);
                if (qres.rowCount > 0) {
                  res.send({
                    success: true,
                  });
                } else {
                  res.send({
                    success: false,
                  });
                }
              })
              .catch((e) => console.error(e.stack));
          } else {
            dbclient
              .query(
                `update contact set last_time = current_timestamp
                        where (user1=$1 and user2=$2) or (user1=$2 and user2=$1)`,
                [req.session.userid, req.body.recip],
              )
              .then((qres2) => {
                //console.log(qres);
                if (qres.rowCount > 0) {
                  res.send({
                    success: true,
                  });
                } else {
                  res.send({
                    success: false,
                  });
                }
              })
              .catch((e) => console.error(e.stack));
          }
        } else {
          res.send({
            success: false,
          });
        }
      })
      .catch((e) => console.error(e.stack));
  }
});

app.post("/api/getMoreMessages", async (req, res) => {
  console.log(req.body);
  if (req.session.userid) {
    console.log("GOT LAST LOADED");
    if (req.body.recip.substring(0, 5) == "group") {
      try {
        let qres2 = await dbclient.query(
          `select serial from contact where (user1=$1 and user2=$2) or (user1=$2 and user2=$1)`,
          [req.session.userid, req.body.recip],
        );
        dbclient
          .query(
            `select *, (select name from user_account where userid=$1) from message
                    where recip=$1 and id < $2
                    order by timestamp desc limit 30`,
            [req.body.recip, req.body.oldest],
          )
          .then((qres) => {
            //console.log(qres);
            res.send(qres.rows);
          })
          .catch((e) => console.error(e.stack));
      } catch (e) {
        console.log(e);
      }
    } else {
      dbclient
        .query(
          `select *, (select name from user_account where userid=$2) from message
                where ((sender=$1 and recip=$2) or (sender=$2 and recip=$1)) and id < $3
                order by timestamp desc limit 30`,
          [req.session.userid, req.body.recip, req.body.oldest],
        )
        .then((qres) => {
          //console.log(qres);
          res.send(qres.rows);
        })
        .catch((e) => console.error(e.stack));
    }
  }
});

app.post("/api/getMessages", async (req, res) => {
  console.log(req.body);
  if (req.session.userid) {
    if (req.body.lastLoaded != "") {
      console.log("GOT LAST LOADED");
      if (req.body.recip.substring(0, 5) == "group") {
        try {
          let qres2 = await dbclient.query(
            `select serial from contact where (user1=$1 and user2=$2) or (user1=$2 and user2=$1)`,
            [req.session.userid, req.body.recip],
          );
          if (qres2.rows.length > 0) {
            dbclient
              .query(
                `select *, (select name from user_account where userid=$1) from message
                        where recip=$1 and id > $2
                        order by timestamp desc limit 30`,
                [req.body.recip, req.body.lastLoaded],
              )
              .then((qres) => {
                //console.log(qres);
                res.send(qres.rows);
              })
              .catch((e) => console.error(e.stack));
          } else
            res.send({
              success: false,
            });
        } catch (e) {
          console.log(e);
        }
      } else {
        dbclient
          .query(
            `select *, (select name from user_account where userid=$2) from message
                    where ((sender=$1 and recip=$2) or (sender=$2 and recip=$1)) and id > $3
                    order by timestamp desc limit 30`,
            [req.session.userid, req.body.recip, req.body.lastLoaded],
          )
          .then((qres) => {
            //console.log(qres);
            res.send(qres.rows);
          })
          .catch((e) => console.error(e.stack));
      }
    } else {
      if (req.body.recip.substring(0, 5) == "group") {
        try {
          let qres2 = await dbclient.query(
            `select serial from contact where (user1=$1 and user2=$2) or (user1=$2 and user2=$1)`,
            [req.session.userid, req.body.recip],
          );
          if (qres2.rows.length > 0) {
            dbclient
              .query(
                `select *, (select name from user_account where userid=$1) from message where recip=$1
                            order by timestamp desc limit 30`,
                [req.body.recip],
              )
              .then((qres) => {
                //console.log(qres);
                res.send(qres.rows);
              })
              .catch((e) => console.error(e.stack));
          } else
            res.send({
              success: false,
            });
        } catch (e) {
          console.log(e);
        }
      } else {
        dbclient
          .query(
            `select *, (select name from user_account where userid=$2) from message
                    where (sender=$1 and recip=$2) or (sender=$2 and recip=$1)
                    order by timestamp desc limit 30`,
            [req.session.userid, req.body.recip],
          )
          .then((qres) => {
            //console.log(qres);
            res.send(qres.rows);
          })
          .catch((e) => console.error(e.stack));
      }
    }
  }
});

app.post("/api/updateSeen", async (req, res) => {
  console.log(req.body);
  if (req.session.userid) {
    if (req.body.recip.substring(0, 5) == "group") {
      try {
        let qres2 = await dbclient.query(
          `select serial from contact where user1=$1 and user2=$2`,
          [req.session.userid, req.body.recip],
        );
        if (qres2.rows.length > 0) {
          dbclient
            .query(
              `update contact set
                        seen1 = case
                            when user1=$1 then $3
                            else seen1
                        end,
                        seen2 = $3
                        where user2=$2
                        returning user1 as u_seen, seen1 as c_seen`,
              [req.session.userid, req.body.recip, req.body.lastSeen],
            )
            .then((qres) => {
              //console.log(qres);
              if (qres.rowCount > 0) {
                let seen = {};
                let seenList = [...qres.rows];
                seenList.forEach((s) => {
                  seen[s.u_seen] = s.c_seen;
                });
                res.send({
                  success: true,
                  cSeen: seen,
                });
              } else if (qres.rowCount === 0) {
                res.send({
                  success: false,
                });
              }
            })
            .catch((e) => console.error(e.stack));
        } else
          res.send({
            success: false,
          });
      } catch (e) {
        console.log(e);
      }
    } else {
      dbclient
        .query(
          `update contact set
                seen1 = case
                    when user1=$1 then $3
                    else seen1
                end,
                seen2 = case
                    when user2=$1 then $3
                    else seen2
                end
                where user1=$1 and user2=$2 or user1=$2 and user2=$1
                returning case
                    when user1=$1 then seen2
                    else seen1
                end as c_seen`,
          [req.session.userid, req.body.recip, req.body.lastSeen],
        )
        .then((qres) => {
          //console.log(qres);
          if (qres.rowCount === 1) {
            let seen = {};
            seen[req.body.recip] = qres.rows[0].c_seen;
            res.send({
              success: true,
              cSeen: seen,
            });
          } else if (qres.rowCount === 0) {
            res.send({
              success: false,
            });
          }
        })
        .catch((e) => console.error(e.stack));
    }
  }
});

app.post("/api/getUserList", (req, res) => {
  console.log(req.session);
  // if (req.session.userid=="ADMIN") {
  dbclient
    .query(
      `select userid, name from user_account where type='client' order by name`,
    )
    .then((qres) => {
      //console.log(qres);
      if (qres.rows.length === 0)
        res.send({
          success: false,
        });
      else {
        res.send({
          users: [...qres.rows],
          success: true,
        });
      }
    })
    .catch((e) => console.error(e.stack));
  // };
});

app.post("/api/getSupportMemberList", (req, res) => {
  console.log(req.session);
  if (req.session.userid == "ADMIN") {
    dbclient
      .query(`select * from support_account`)
      .then((qres) => {
        //console.log(qres);
        if (qres.rows.length === 0)
          res.send({
            success: false,
          });
        else {
          res.send({
            members: [...qres.rows],
            success: true,
          });
        }
      })
      .catch((e) => console.error(e.stack));
  }
});

app.post("/api/getFilePreview", (req, res) => {
  // if (req.session.userid=="ADMIN") {
  //console.log(qres);
  const efile = excelReader.readFile("uploads/" + req.body.file_id);
  const temp = excelReader.utils.sheet_to_html(
    efile.Sheets[efile.SheetNames[0]],
    {
      id: "previewTable",
      header: "",
      footer: "",
    },
  );
  //console.log(temp);
  res.send({
    success: true,
    html: temp,
  });
  // };
});

app.post("/api/assignSupportMember", (req, res) => {
  if (req.session.userid == "ADMIN") {
    dbclient
      .query(`update report set assigned_support=$1 where id=$2`, [
        req.body.support_id,
        req.body.file_id,
      ])
      .then((qres) => {
        //console.log(qres);
        if (qres.rows.length === 0)
          res.send({
            success: false,
          });
        else
          res.send({
            success: true,
          });
      })
      .catch((e) => console.error(e.stack));
  }
});

// app.get('/api/getUserDoc', (req, res) => {
//     if (req.session.userid) {
//         dbclient.query(
//             `SELECT doc, docname FROM request WHERE id=$1 and user_mobile=$2`,
//             [Number(req.query.rid), req.session.userid]
//         ).then(qres => {
//             console.log(qres.rows);
//             if (qres.rows.length > 0) {
//                 const stream = Readable.from(qres.rows[0].doc);
//                 // res.setHeader('Content-Type', 'application/pdf');
//                 res.setHeader('Content-Disposition', 'inline; filename=' + qres.rows[0].docname);
//                 stream.pipe(res);
//             } else res.send("User/admin login is required to access the ticket.");
//         }).catch(e => console.error(e.stack));
//     } else if (req.session.adminid) {
//         dbclient.query(
//             `SELECT doc, docname FROM request WHERE id=$1`,
//             [Number(req.query.rid)]
//         ).then(qres => {
//             console.log(qres.rows);
//             if (qres.rows.length > 0) {
//                 const stream = Readable.from(qres.rows[0].doc);
//                 // res.setHeader('Content-Type', 'application/pdf');
//                 res.setHeader('Content-Disposition', 'inline; filename=' + qres.rows[0].docname);
//                 stream.pipe(res);
//             } else res.send("User/admin login is required to access the file.");
//         }).catch(e => console.error(e.stack));
//     } else res.send("User/admin login is required to access the file.");
// });

app.get("/api/getUserDoc", (req, res) => {
  console.log(req.query);
  dbclient
    .query(`SELECT original_filename FROM report WHERE id=$1`, [req.query.rid])
    .then(async (qres) => {
      console.log(qres.rows);
      if (qres.rows.length > 0) {
        try {
          let data = await fs.readFile("uploads/" + req.query.rid);
          const stream = Readable.from(data);
          // res.setHeader('Content-Type', 'application/pdf');
          res.setHeader(
            "Content-Disposition",
            "inline; filename=" + qres.rows[0].original_filename,
          );
          stream.pipe(res);
        } catch (e) {
          if (e.code != "ENOENT") errLogger.error(e);
        }
      } else res.send("User/admin login is required to access the ticket.");
    })
    .catch((e) => console.error(e.stack));
});

app.get("/breakingBad", (req, res) => {
  res.send(`<h3>Breaking Bad</h3>(copy link and paste in url bar if clicking link doesn't download file)
<br /><h4> SEASON 1 </h4><ol><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=e74d0ed0-0de4-4f43-88f8-3911e0e2ee9a">S1E1</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=75041451-b7db-4861-a2f8-8873b2a4bed9">S1E2</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=aa358bf2-3d41-4406-9f29-1fe28e29eb92">S1E3</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=4b877d5d-4ffa-45b2-a0eb-458e2700ea83">S1E4</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=a6db3f0a-7726-4104-a212-3d8877ea962f">S1E5</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=6c2effff-61e1-4ff4-91e3-ff0a3c951ba0">S1E6</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=60aa0359-dc39-4b99-af78-57ea62c505b1">S1E7</a></li>
</ol><h4> SEASON 2 </h4><ol><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=3b5a1c8c-fbe3-4333-a44d-44a1a359cb72">S2E1</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=80f42ecb-ca58-4707-81bd-8388fc773283">S2E2</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=a1a2f411-8848-4be2-ae0f-c36f75664f9d">S2E3</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=660825ef-7f09-49e3-be81-d81a7f0b0f69">S2E4</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=5841bf66-526c-4912-aa39-f3f7350608c5">S2E5</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=7e012d53-9049-4fb8-82e8-37e756c17616">S2E6</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=1dc839aa-0964-4cc8-84fa-96e15d6dc6b8">S2E7</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=f3e7bf48-467c-4229-affe-bb6309b0a3f6">S2E8</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=a75c2fea-451a-4314-be22-0854e9dd0bdc">S2E9</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=8678ff43-78e4-4544-a1c5-6053ae09c77f">S2E10</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=d1d5d34d-98ad-4871-8db0-265dc35fbf9a">S2E11</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=cdddea62-a5c2-4558-a04a-f88bb89f2efa">S2E12</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=25936d01-8236-4038-b2b7-878594b42692">S2E13</a></li></ol></ol><h4> SEASON 3 </h4><ol><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=4c4bab47-020c-4634-95d7-8f5628f6cdb8">S3E1</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=4d05f4e5-6272-4d74-95fe-d927184f387d">S3E2</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=d634914d-865e-4e61-94d8-c48720dcc910">S3E3</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=7bbdb760-4ee6-4ed4-84e8-8d6d11ed7b46">S3E4</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=1c76a39f-f8f0-439a-a062-5f6ac7f9c214">S3E5</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=03b5c8ed-d527-4a36-82e3-d498fcc081d5">S3E6</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=2fb81b56-40d9-4b1b-ac9c-fb9991114a8f">S3E7</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=344def19-d1c2-446e-b412-a875b7951f9c">S3E8</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=5a1c762b-c184-4667-9790-85d0cc4a6a58">S3E9</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=c1913441-398f-4c5b-b757-ac0036d918f4">S3E10</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=806cc43d-4dbd-4db2-b159-3004f8717772">S3E11</a></li>
<li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=ee41b111-ef4e-4422-82a7-b1e95298a914">S3E12</a></li><li><a href="http://103.94.135.119:6969/api/getUserDoc?rid=92324556-f290-4a86-b4db-ef6e882ed809">S3E13</a></li></ol>`);
});

app.post("/api/getNotices", (req, res) => {
  dbclient
    .query(
      "SELECT title, text, time_posted FROM notice ORDER BY time_posted DESC",
    )
    .then((qres) => {
      res.send(qres.rows);
    })
    .catch((e) => console.error(e.stack));
});

app.use(express.static(path.resolve(__dirname, "../client/dist")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/dist", "index.html"));
});

app.listen(port, () => {
  console.log(`NBR TDS Helper backend listening on port ${port}`);
});

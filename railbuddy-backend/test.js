// const axios = require("axios");

// const options = {
//   method: 'POST',
//   url: 'https://national-id-verification-bangladesh.p.rapidapi.com/api/nid-check',
//   headers: {
//     'content-type': 'application/json',
//     'X-RapidAPI-Key': '2fb063fe39mshd1ed0a0af136e19p1844d1jsnd824c451c09c',
//     'X-RapidAPI-Host': 'national-id-verification-bangladesh.p.rapidapi.com'
//   },
//   data: '{"nid":"8715282235","dob":"2001-07-26"}'
// };

// axios.request(options).then(function (response) {
// 	console.log(response.data);
// }).catch(function (error) {
// 	console.error(error);
// });

// let crypto = require('crypto');
// let listOfSupportedHashes = crypto.getHashes();
// console.log('Total supported hashes : ', listOfSupportedHashes);


// console.log( crypto.createHash('sha256').update(JSON.stringify("bogm")).digest('hex') );

console.log ( (new Date()).toISOString() );
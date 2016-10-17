const config = require(`../config/${process.env.NODE_ENV || 'production'}`);
var querystring = require('querystring');
var request = require('request');

var process_message = function(text) {
  var data = querystring.stringify({query: text});

  request({
    headers: {
      'x-app-id': config.threeScale.appId,
      'x-app-key': config.threeScale.appKey
    },
    uri: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
    body: data,
    method: 'POST'
  }, function(err, res, body) {
    if (!error) {
      return body.foods[0].food_name + ' has about ' + body.foods[0].nf_calories + ' calories.';
    } else {
      return 'Could not detect any foods.'
    }

  })

};


module.exports = {
  process_message: process_message
};

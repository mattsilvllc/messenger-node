const config = require(`../config/${process.env.NODE_ENV || 'production'}`);
var querystring = require('querystring');
var request = require('request');

var process_message = function(text) {
  var data = {'query': text};

  request({
    headers: {
      'x-app-id': config.threeScale.appId,
      'x-app-key': config.threeScale.appKey
    },
    uri: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
    json: data,
    method: 'POST'
  }, function(err, res, body) {
    if (res.status_code !=== 200) {
      return 'Could not detect any foods.'
    } else {
      return body.foods[0]s.food_name + ' has about ' + body.foods[0].nf_calories + ' calories.';
    }

  })

};


module.exports = {
  process_message: process_message
};

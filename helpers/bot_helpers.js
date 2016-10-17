'use strict';

const _ = require('lodash');
const config = require(`../config/${process.env.NODE_ENV || 'production'}`);
var querystring = require('querystring');
const bb = require('bluebird');
var request = bb.promisifyAll(require('request'));

var process_message = function(text, reply) {
  var data = {'query': text};

  return request.postAsync({
    headers: {
      'x-app-id': config.threeScale.appId,
      'x-app-key': config.threeScale.appKey
    },
    uri: 'https://trackapi.nutritionix.com/v2/natural/nutrients',
    json: data
  })
    .then(res => {
      let text;
      let body = res.body;
      if (res.statusCode === 404) {
        text = 'Could not match foods';
      }
      else if (res.statusCode > 200) {
        throw new Error(`status code: ${res.statusCode}`);
      } else {
        let cals = _.reduce(body.foods, (a, b) => a + b.nf_calories, 0);
        text = `you ate ${cals} calories`;
      }
      return reply({text});
    })
    .catch(err => {
      console.error(err);
    });
};


module.exports = {
  process_message
};

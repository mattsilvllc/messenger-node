'use strict';

const _ = require('lodash');
const config = require(`../config/${process.env.NODE_ENV || 'production'}`);
var querystring = require('querystring');
const bb = require('bluebird');
var request = bb.promisifyAll(require('request'));

var process_message = function(text, reply) {
  reply({
    setting_type: 'greeting',
    greeting: {
      text: 'Welcome to Nutritionix Track. I can give you nutrition info for many different foods. Simply list the foods you would like to know about.'
    }
  })
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
        return reply({text});
      }
      else if (res.statusCode > 200) {
        throw new Error(`status code: ${res.statusCode}`);
      } else {

        let elements = [];
        let cals = _.reduce(body.foods, (a, b) => a + b.nf_calories, 0);
        text = `That is about ${cals} total calories. Click the link below for more nutrition details.`;
        reply({text})
        _.forEach(body.foods, function(food) {
          let nat_q = food.serving_qty + ' ' + food.serving_unit + ' ' + food.food_name
          if (food.food_name.includes(food.serving_unit)) {
            nat_q = food.serving_qty + ' ' + food.food_name;
          }

          let element = {
            title: food.food_name,
            subtitle: food.serving_qty + ' ' + food.serving_unit,
            image_url: food.photo.thumb,
            buttons: [{type: 'web_url', title: 'View Details', url: `https://www.nutritionix.com/natural-demo?q=${nat_q}`}]
          };
          elements.push(element);
        })

        return reply({
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: elements
            }
          }
        })
      }
    })
    .catch(err => {
      console.error(err);
    });
};

var welcome = function(reply) {
  reply({text: "Please link your account"});
  reply({
    attachment: {
      type: 'template',
      payload: {
        template_type: 'generic',
        elements: [{title: "login", buttons: [{type: "account_link", url: "https://www.nutritionix.com/messenger-bot/authorize"}]}]
      }
    }
  })
};


module.exports = {
  process_message,
  welcome
};

'use strict';

const _ = require('lodash');
const config = require(`../config/${process.env.NODE_ENV || 'production'}`);
var querystring = require('querystring');
const bb = require('bluebird');
var request = bb.promisifyAll(require('request'));
var db = require('../lib/db')(config.database);
var trackutils = require('../lib/trackUtils')(db);

var nutrients_helper = function(text, reply) {
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
          .then(() => {
            let promptUser = (Math.round() * 10) < 1;
            if (promptUser) {
              return reply({text: "You know, you can link your account to keep a record of foods you log. Hold on, let me find that link..."})
                .delay(700)
                .then(() => {
                  return reply({
                    attachment: {
                      type: 'template',
                      payload: {
                        template_type: 'generic',
                        elements: [{title: "login", buttons: [{type: "account_link", url: "https://www.nutritionix.com/messenger-bot/authorize"}]}]
                      }
                    }
                  })
                })
            }
          })
      }
    })
    .catch(err => {
      console.error(err);
    });
}

var log_helper = function(text, user_jwt, reply) {
  var data = {'query': text};

  return request.postAsync({
    headers: {
      'x-app-id': config.threeScale.appId,
      'x-app-key': config.threeScale.appKey,
      'x-user-jwt': user_jwt
    },
    uri: 'https://trackapi.nutritionix.com/v2/natural/add',
    json: data
  })
    .then(res => {
      let text;
      let body = res.body;
      if (res.statusCode === 404) {
        text = 'Could not identify foods to add.';
        return reply({text});
      }
      else if (res.statusCode > 201) {
        throw new Error(`status code: ${res.statusCode}`);
      } else {
        let elements = [];
        let cals = _.reduce(body.foods, (a, b) => a + b.nf_calories, 0);
        text = `You have added a total of ${cals} calories to your food log. Click the links below to view your foodlog.`;
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
            buttons: [{type: 'web_url', title: 'View log', url: `https://www.nutritionix.com/dashboard`}]
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
}

var process_message = function(payload, reply) {
  var trackAccount = trackutils.getTokenByScopedId(payload.sender.id)
    .then(credentials => {
      if (!credentials) {
        return nutrients_helper(payload.message.text, reply);
      } else {
        return log_helper(payload.message.text, credentials['x-user-jwt'],reply);
      }
    })

};

var welcome = function(reply) {
  reply({text: "Please link your account. Once linked you will be able to add foods to your foodlog by messaging me what you ate. You are still able to retrieve nutritional information for foods without linking."})
  .then(() => {
    return reply({
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [{title: "login", buttons: [{type: "account_link", url: "https://www.nutritionix.com/messenger-bot/authorize"}]}]
        }
      }
    })
  })
};

var confirmLink = function(reply) {
  console.log('conflink');
  return reply({text: 'You have succesffully linked. What have you eaten today?'})
}


module.exports = {
  process_message,
  welcome,
  confirmLink
};

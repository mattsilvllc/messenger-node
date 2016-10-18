const Bot = require('messenger-bot')
const config = require(`./config/${process.env.NODE_ENV || 'production'}`);
const http = require('http');
var bot_helper = require('./helpers/bot_helpers.js');
const bb = require('bluebird');

let bot = new Bot(config.mBot);

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  console.log(payload);
  bot_helper.process_message(payload, bb.promisify(reply));
})

bot.on('postback', (payload, reply) => {
  bot_helper.welcome(bb.promisify(reply));
})

bot.on('accountLinked', (payload, reply) => {
  console.log('pay:', payload);
  bot_helper.confirmLink(bb.promisify(reply));
})

http.createServer(bot.middleware()).listen(3000)
console.log('Echo bot server running at port 3000.')

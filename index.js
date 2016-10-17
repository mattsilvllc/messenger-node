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
  let text = payload.message.text;
  bot_helper.process_message(text, bb.promisify(reply));
})

http.createServer(bot.middleware()).listen(3000)
console.log('Echo bot server running at port 3000.')

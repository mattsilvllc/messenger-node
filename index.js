const http = require('http')
const Bot = require('messenger-bot')
const config = require(`./config/${process.env.NODE_ENV || 'production'}`);
var bot_helper = require('./helpers/bot_helpers.js');

let bot = new Bot(config.mBot);

bot.on('error', (err) => {
  console.log(err.message)
})

bot.on('message', (payload, reply) => {
  let text = payload.message.text;

  var response = bot_helper.process_message(text);
  reply({ text: response }, (err) => {
    if (err) throw err
    console.log(`Echoed back to ${profile.first_name} ${profile.last_name}: ${text}`)
  })

})

http.createServer(bot.middleware()).listen(3000)
console.log('Echo bot server running at port 3000.')

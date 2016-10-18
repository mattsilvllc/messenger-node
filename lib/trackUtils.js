'use strict';

const _ = require('lodash');

module.exports = function(db) {
  return {
    getTokenByScopedId: _.bind(getTokenByScopedId, null, db)
  };
}

function getTokenByScopedId(db, psid) {
  return db('messenger_bot_psids')
    .join('users', 'messenger_bot_psids.user_id', '=', 'users.id')
    .join('users_tokens', 'users_tokens.user_id', '=', 'users.id')
    .where('messenger_bot_psids.psid', psid)
    .groupBy('messenger_bot_psids.psid')
    .select('users_tokens.token')
    .then(([match]) => {
      if (!match) {
        return null;
      }
      return {
        'x-user-jwt': match.token
      };
    });
}

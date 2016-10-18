'use strict';

const knex = require('knex');
const _ = require('lodash');

module.exports = _.once(conf => knex(conf));

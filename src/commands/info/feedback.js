import Promise from 'bluebird';
import nconf from 'nconf';
import R from 'ramda';

import { getShardsCmdResults } from '../../redis';
import T from '../../translate';

let argv = require('minimist')(process.argv.slice(2));


function feedback(client, evt, suffix, lang, shard_message) {
  if (!nconf.get('FEEDBACK_CHANNEL_ID')) return Promise.resolve(T('feedback_setup', lang));
  if (!suffix) return Promise.resolve(T('feedback_usage', lang));

  let message;
  if (shard_message) {
    message = suffix;
  } else {
    message = `**[${evt.message.author.id}] (${evt.message.author.username}#${evt.message.author.discriminator})\n[${R.path(['guild', 'id'], evt.message) || 'DM'}] (${R.path(['guild', 'name'], evt.message) || 'DM'})**\n${suffix.replace(/([@#*_~`])/g, '\\$1')}`;
  }

  const channel = client.Channels.find(channel => channel.id === nconf.get('FEEDBACK_CHANNEL_ID'));
  if (channel) channel.sendMessage(message);
  if (!channel && !shard_message && argv.shardmode) getShardsCmdResults('feedback', message);
  if (evt && evt.message) evt.message.reply(T('feedback_reply', lang));

  return Promise.resolve();
}

export default {
  feedback
};

export const help = {
  feedback: { parameters: 'text' }
};

/* global client, plugin */
/* global formatException */

// PLUGIN ENVIRONMENT //

plugin.id = 'topic-copy';

plugin.init =
function _init(glob) {
    this.major = 1;
    this.minor = 4;
    this.version = this.major + '.' + this.minor + ' (16 Mar 2019)';
    this.description = 'Copies topic changes into chat for non-IRC linked platforms. ' +
    "By James Ross <chatzilla-plugins@james-ross.co.uk>.";

    this.prefary.push(['channels', '', '']);

    return 'OK';
}

plugin.enable =
function _enable() {
    client.eventPump.addHook([
        { set: 'channel', type: 'topic' }
    ],
        plugin.onTopic,
        plugin.id + '-channel-topic');
    client.eventPump.addHook([
        { set: 'channel', type: 'privmsg' }
    ],
        plugin.onPrivmsg,
        plugin.id + '-channel-privmsg');
    return true;
}

plugin.disable =
function _disable() {
    client.eventPump.removeHookByName(plugin.id + '-channel-topic');
    client.eventPump.removeHookByName(plugin.id + '-channel-privmsg');
    return true;
}

plugin.onTopic =
function _ontopic(e) {
    try {
        const channels = plugin.prefs['channels'].split(',');
        if (channels.includes(e.channel.getURL())) {
            const topic = sanitizeTopic(e.channel.topic);
            const user = e.user.unicodeName.replace(/\b(\w)(\w+)\b/g, '$1\u200B$2');
            e.channel.dispatch('say [Topic changed by ' + user + '] ' + topic);
        }
    } catch (ex) {
        client.display('Topic Copy (ontopic): ' + formatException(ex));
    }
}

plugin.onPrivmsg =
function _onprivmsg(e) {
    try {
        const channels = plugin.prefs['channels'].split(',');
        if (channels.includes(e.channel.getURL())) {
            if (/^!topic$/.test(e.msg)) {
                const topic = sanitizeTopic(e.channel.topic);
                e.channel.dispatch('say [Topic] ' + topic);
            } else if (/^!topic-set /.test(e.msg)) {
                const newTopic = desanitizeTopic(e.msg.substring(11));
                e.channel.dispatch('topic ' + newTopic);
            } else if (/^!topic-replace /.test(e.msg)) {
                const topicChanges = desanitizeTopic(e.msg.substring(15)).split('|||');
                const newTopic = e.channel.topic.replace(topicChanges[0], topicChanges[1]);
                e.channel.dispatch('topic ' + newTopic);
            }
        }
    } catch (ex) {
        client.display('Topic Copy (onprivmsg): ' + formatException(ex));
    }
}

function sanitizeTopic(topic) {
    return topic.replace(/\b(\w)(\w+)\b/g, '$1\u200B$2').replace(/(h\u200Bttps?:|w\u200Bww\.)\S+/g, function(text) { return text.replace(/\u200B/g, '') });
}

function desanitizeTopic(topic) {
    return topic.replace(/\u200B/g, '');
}

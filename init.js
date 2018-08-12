/* global client, plugin */
/* global formatException */

// PLUGIN ENVIRONMENT //

plugin.id = 'topic-copy';

plugin.init =
function _init(glob) {
    this.major = 1;
    this.minor = 1;
    this.version = this.major + '.' + this.minor + ' (12 Aug 2018)';
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
    return true;
}

plugin.disable =
function _disable() {
    client.eventPump.removeHookByName(plugin.id + '-channel-topic');
    return true;
}

plugin.onTopic =
function _ontopic(e) {
    try {
        const channels = plugin.prefs['channels'].split(',');
        if (channels.includes(e.channel.getURL())) {
            const topic = e.channel.topic.replace(/\b(\w)(\w+)\b/g, '$1\u200B$2');
            const user = e.user.unicodeName.replace(/\b(\w)(\w+)\b/g, '$1\u200B$2');
            e.channel.dispatch('say [Topic changed by ' + user + '] ' + topic);
        }
    } catch (ex) {
        client.display('Topic Copy: ' + formatException(ex));
    }
}

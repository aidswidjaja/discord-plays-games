const Discord = require('discord.io');
const robot = require('robotjs');

const config = require('./config.json');

const co = require('co');

let bot;
let botChannel;
let lastButtonPress = 0;

function log(msg) { /* time will be logged in UTC because Windows Server 2019 for Datacenters on GCP is dumb and can't change timezones */
    const d = new Date();
    const t = '(' + (d.getMonth() + 1) + '/' + d.getDate() + '/' +
        d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ') ';
    console.log(t + 'DISCORD BOT: ' + msg);
}

function getManyMessages(cb) {
    log('getting messages!');
    bot.getMessages({
        channelID: botChannel,
        limit: 100
    }, function(err, messages) {
        if (err) {
            console.error(err);
        }
        cb(messages || []);
    });
}

function deleteMessages(messages, cb) {
    let method;
    let opts = {channelID: botChannel};
    messages = messages || [];
    if (messages.length === 1) {
        method = 'deleteMessage';
        opts.messageID = messages[0].id;
    } else {
        method = 'deleteMessages';
        opts.messageIDs = messages.map(function(msg) {
            return msg.id;
        });
    }
    if (messages.length) {
        log('deleting messages!');
        bot[method](opts, function(err) {
            if (err) {
                console.error(err);
            }
            if (cb) {
                cb(err);
            }
        });
    }
}

function updateScreen() {
    log('uploading image!');
    const cmdCooldown = config.commandCooldown / 1000;
    bot.uploadFile({
        to: config.botChannel, /* channel ID must be a string */
        file: config.screenshotPath,
        message: config.discordBotMessage
    }, function(err) {
        if (err) {
            console.error(err);
        }
    });
}

function cleanABunch() {
	log('clean');
    getManyMessages(function(messages) {
        deleteMessages(messages, updateScreen);
    });
}

function saveGame() {
    log('saving game');
	
	robot.keyTap('f1', ['shift']);
	updateScreen();

};

function startDiscordBot() {
    bot = new Discord.Client({
        token: config.discordToken,
        autorun: true
    });

    bot.on('ready', function() {
        log('Discord: I am ready!');

        const channels = Object.keys(bot.channels);
        for (let x = 0; x < channels.length; x++) {
            const chan = bot.channels[channels[x]];
            if (chan.type === 'text' && chan.name === config.botChannel) {
                botChannel = channels[x];
                break;
            }
        }
    });

    const specialCommands = {
        update: updateScreen,
        clean: cleanABunch,
		save: saveGame
    };
	
    bot.on('message', function(user, userID, channelID, message, event) {
        const upMessage = (message || '').toLowerCase();
        const messageParts = upMessage.split('*').map(function(part) {
            return part.trim();
        });
        const cmd = messageParts[0];
        let repeat = 1;
        if (messageParts[1]) {
            repeat = parseInt(messageParts[1]); /* parse string to int */
            if (isNaN(repeat)) { /* check for valid number */
                repeat = 1;
            }
            repeat = Math.max(Math.min(repeat, config.maxButtonPressesPerTurn), 1);
        }
		
		log('message received : ' + message);

        const isValidKey = !!config.chatToKeyboardKey[cmd]; /* !! = boolean */
        const specialCommand = specialCommands[cmd];
        
		 if (isValidKey || specialCommand) {
            const now = Date.now();
			
            log('got command: ' + cmd);

            if (cmd === 'CLEAN') {
                cleanABunch();
			}
				
			if (cmd === 'SAVE') {
				saveGame();
				updateScreen();
			}
				
			else {
                process.send({cmd, repeat});
			}
			
            }});
	

    bot.on('disconnect', function(errMsg, code) {
        log('===== Disconnected! ErrCode: ' + code);
        log('===== Error: ' + errMsg);
        throw new Error('disconnect error!');
    });


	process.on('message', function(msg) {
		log('got outside message: ' + msg);
		if (msg === 'update') {
			updateScreen();
		}
		
		if (msg === 'save') {
			saveGame();
			updateScreen();

		}
	})
}

startDiscordBot();

log('running...');

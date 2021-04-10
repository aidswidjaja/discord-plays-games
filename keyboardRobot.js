const fs = require('fs');

const co = require('co');
const robot = require('robotjs');

const config = require('./config.json');

/*
Go to a site like this:
https://jsemu3.github.io/gba/launcher.html#pokemonsapphire
It is using https://github.com/taisel/IodineGBA

You need to inject a script like this:
(function() {
    function setup() {
        try {
            Iodine.changeVolume(0);
        } catch(e) {
            setTimeout(setup, 1000);
            return;
        }

        const canvas = document.querySelector('canvas');

        const keys = {
            P: 80,
            I: 73,
            O: 79
        }

        document.body.addEventListener('keydown', function(e) {
            if (e.keyCode === keys.P) {
                var link = document.createElement('a');
                link.href = canvas.toDataURL();
                link.download = 'screen.png';
                link.click();
            } else if (e.keyCode === keys.I) {
                Iodine.pause();
            } else if (e.keyCode === keys.O) {
                Iodine.play();
            }
        });
    }

    setup();
})();


Keep the browser focused while the bot runs.
*/

function log(msg) { /* time will be logged in UTC because Windows Server 2019 for Datacenters on GCP is dumb and can't change timezones */
    const d = new Date();
    const t = '(' + (d.getMonth() + 1) + '/' + d.getDate() + '/' +
        d.getFullYear() + ' ' + d.getHours() + ':' + d.getMinutes() + ':' + d.getSeconds() + ') ';
    console.log(t + 'KEYBOARD BOT: ' + msg);
}

const sleep = function(amt) {
    return new Promise(function(res) {
        setTimeout(res, amt);
    });
};

const pressButton = co.wrap(function*(button, repeat, delay) {
    button = button.toLowerCase();

    const keyboardKey = config.chatToKeyboardKey[button];
    const downUpDelay = delay || 100;
    const betweenBtnDelay = 500;

    let waitTime = 0;

    if (keyboardKey) {
        while (repeat > 0) {
			robot.keyTap(keyboardKey);

            if (repeat > 1) {
                yield sleep(betweenBtnDelay);
                waitTime += betweenBtnDelay;
            }
            repeat--;
        }
    }

    return waitTime;
});

let canPressButton = true;

const saveScreenshot = co.wrap(function*() {
    log('taking screenshot');
	
	robot.keyTap('s', ['control', 'shift']);

    log('waiting for screenshot to save');
	
    if (fs.existsSync(config.screenshotPath) == false) {
		log('WARNING: did not detect screenshotPath (path == false)');
    }
	
});

const processMessage = co.wrap(function*(msg) {
    log('got outside message (JSON stringify): ' + JSON.stringify(msg));
    if (!canPressButton) {
        return;
    }
    canPressButton = false;

	yield pressButton(msg.cmd, msg.repeat);

	yield saveScreenshot();
	process.send('update');
	
    canPressButton = true;
	
});

process.on('message', processMessage);

log('Ready to press keys!');



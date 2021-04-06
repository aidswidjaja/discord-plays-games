# discord-plays-games

This is a modified version of the original version by [kylepaulsen](https://github.com/kylepaulsen/discord-plays-games) that fixes a number of compatibility issues and simplifies the project overall. Things I've changed:

- some functionality has been removed, namely pause/unpause.
- sleep() functions have been reduced to improve speediness. This should not impact performance or reliability.
- more inline code comments and logging has been added for easier debugging.
- some logic has been reworked (with bad adrian code) such that the bot should now work on the reference implementation below. The bot in vanilla stage encountered some problems running.

![image](https://user-images.githubusercontent.com/36395320/113668278-5577ca80-96f5-11eb-812e-8f9c9681c461.png)

## Reference implementation

- OS: Microsoft Windows Server 2019 Datacenter with Desktop Experience version 1809 (GCP public image) accessed through RDP
- VM: e2-custom (4 vCPUs, 8 GB memory) on Google Cloud Platform Compute Engine in region australia-southeast-1b
- Terminal emulator: Windows PowerShell 5.1.17763.1490
- DS emulator: NO$GBA gaming edition

Note: the Ctrl-Shift-S screenshot key is hardcoded into keyboardRobot.js and triggers a window screenshot in [Greenshot](https://getgreenshot.org/). On a standard Windows 10 installation this will trigger the Snip & Sketch tool which you may need to adjust in order to suit your needs.

# How to use
1. Make a discord bot and get a discord token. [See here](https://github.com/reactiflux/discord-irc/wiki/Creating-a-discord-bot-&-getting-a-token)
2. Download this repo
3. ```npm install``` - if you encounter issues installing robotjs through the script, remove it from package.json, then install it manually via `npm install robotjs`
5. ```node start.js``` (it will make config.json for you and then exit.)
6. edit config.json and put your discord bot token in there. Change anything else as needed.
7. ```node start.js```
8. Make sure the game is in focus.

## Tools used

- Mozilla Firefox ESR
- GitHub
- Notepad++

thanks guys <3

# License
MIT

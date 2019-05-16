# BlacklistedServerChecking

> Forked from [RussellG89's script](https://github.com/RussellG89/Blacklisted-Server-Checking) with suggestions from [nileplumb](https://github.com/nileplumb)

1: Create a user account and join all the servers you want checked for your members.

2: Fill out `blacklist_config.json.example` in files and rename to `blacklist_config.json`. 
- The user token must be the account you just created. Google "How to get discord user token" for how to get a user token.
- The bot token must be a bot in your server with rights to kick or ban members based on your config settings. 
- `POUND_LEVEL` in the config can be `KICK`, `BAN`, `ROLE`, `NICK` or `NICKROLE`.
- Add `%SPOOFSERVERS%` anywhere in the config message to get the names of blacklisted servers they have joined.

3: Install [Node.js](https://nodejs.org/) if it's not installed already on your machine. 

4: Run `git clone https://github.com/Bjornskjald/Blacklisted-Server-Checking.git` in your terminal.

5: cd to the cloned directory

6: Install required npm modules
  - `npm install`

7: Start the script using `pm2 start index.js`

All Commands must be preceeding by the command prefix in your config file and in the specified channel.
Commands: 
- `check all` -> Checks all users in your server
- `check user_id` -> Checks the user specified in the command (replace user_id with the ID)
- `warn user_id` -> Warns the user about being in blacklisted servers
- `restart` -> Restarts the bot

This bot will automatically monitor users onjoin to your server as well as all of the blacklisted servers. It does not do a check on start-up, so you will need to run a `check all` once started. As long as it is running, it is watching. 

Screenshots:

Example of a user being warned instantly and left the blacklisted server immediately.
![Spoofer2](/files/Photo2.png)

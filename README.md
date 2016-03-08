# CoC manager
Coc manager is a clan manager for Clash of Clans. You are able to setup your profile, and let your mates know a better idea about your availabilities and a better way to manager wars and keep your clan active.

# Installation
Install dependencies:

    npm install
Start the server:

	supervisor server.js

# Deployment:
	
	npm install
	pm2 start server.js

## If already in production
Just `git pull` the project.


`pm2 list`: lists all running applications

`pm2 logs`: shows logs 

`pm2 delete <id>`: deletes an app within its id
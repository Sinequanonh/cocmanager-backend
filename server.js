"use strict";

var express				= require('express');
var app					= express();
var bodyParser 	        = require('body-parser');
var mongoose 	        = require('mongoose');
var randtoken			= require('rand-token');
var clashApi 			= require('clash-of-clans-api');
var sha1 				= require('sha1');
var sha1 				= require('sha1');
var rateLimit 			= require('express-rate-limit');
var _ 					= require('underscore');
// Models
var Users				= require('./models/users');
var Clans				= require('./models/clans');
var objectId 			= mongoose.Types.ObjectId;

// var db = mongoose.connection;
mongoose.connect('mongodb://127.0.0.1:27017/cocmanager');

// mongoose.connect();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var limiter = rateLimit({
	windowMs: 10000,
	delayAfter: 1,
	delayMs: 1000,
	max: 3,
	message: 'Too many requests, please try again later.'
});

var port = process.env.PORT || 8484;

// ROUTES FOR API
// =================================================
var router = express.Router();

router.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "http://localhost");
	res.header('Access-Control-Allow-Origin', "http://127.0.0.1:8080");
	// res.header('Access-Control-Allow-Origin', "http://5.196.71.91:8080");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

router.get('/', function(req, res) {
	console.log(new Date() + ' | ' + "Tentative");
	res.json({ message: 'Home'});
});

// Check if authenticated
router.route('/auth/:auth')
.get(function(req, res) {
	Users.findOne({token: req.params.auth}).exec(function(err, users) {
        if (err)
            res.send(err);
        if (users) {
        	users.password = undefined;
        	console.log(new Date() + ' | ' + "auth: " + users.user);
        	res.json(users);
        }
        else
        	res.json(false);
    });
});

// Signup
router.route('/signup/:username/:password')
	.post(function(req, res) {
		console.log(new Date() + ' | ' + "user name  : " + req.params.username);
		console.log(new Date() + ' | ' + "sha1 passwd: " + sha1(req.params.password));

		Users.findOne({"user": req.params.username}, function(err, user) {
			if (user) {
				res.send({"message": false});
			} else {
				createNewUser();
			}

		});

		var createNewUser = function() {
			var randtok = randtoken.generate(32);
			console.log(new Date() + ' | ' + 'Signing up: generating token... ' + randtok);
			var newSubscribed = new Users({
				token: randtok,
				user: req.params.username,
				password: sha1(req.params.password),
				clan_tag: '',
				clan_name: '',
				clan_badge: '',
				clan_request: false,
				role: '',
				date_created: new Date(),
				bars: {
					barGold: 2,
					barGold_comma: 0,
					barElixir: 4,
					barElixir_comma: 0,
					barDarkElixir: 3,
					barDarkElixir_comma: 0,
					gems: 0
				}
			});
			newSubscribed.save(function(error, data) {
			    if (error) {
			        res.json(error);
			        console.log(new Date() + ' | ' + error);
			    }
			    else {
			    	data.password = undefined;
			        res.json(data);
			        console.log(new Date() + ' | ' + data);
			    }
			});
		};
	});

// Signin
router.route('/signin/:username/:password')
	.get(function(req, res) {
	Users.findOne({user: req.params.username}).exec(function(err, users) {
        if (err)
            res.send(err);
        if (users.password == sha1(req.params.password)) {
        	users.password = undefined;
        	console.log(new Date() + ' | ' + 'Signing in user: ' + req.params.username);
        	res.send(users);
        }
        else {
        	res.json({'message': false});
        }
    });
});

// Clan search
router.route('/searchclan/:name')
	.get(function(req, res) {
		console.log(new Date() + ' | ' + 'Searching clan by name: ' + req.params.name);
		// CoC API
		let client = clashApi({
		  	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjM2ZTBmYTMyLTFkODUtNGY2ZS04NGUzLTVlYWY0YWZmMmQzNSIsImlhdCI6MTQ1Nzg3OTQ2OCwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjg5LjY1LjU5LjM1IiwiNDYuMjI5LjE1My4xNDYiLCI1LjE5Ni43MS45MSIsIjg5Ljc4LjE5NC4xOTYiXSwidHlwZSI6ImNsaWVudCJ9XX0.9_Vk9dNyMb7rz3zjom1lA3JKQJPS2_JLquFDR3Ml93Qnkme1z14rpi8rOUDsUbvHCJcj8h0-ajxud82ytMx2iA" // Optional, can also use COC_API_TOKEN env variable
		});
		client
			.clans()
			.withName(req.params.name)
			.withLimit(20)
			.fetch()
			.then(response => res.send(response))
			.catch(err => console.log(new Date() + ' | ' + err));
	});

// Clan profile
router.route('/clan/:clan_tag')
	.get(function(req, res) {
		console.log(new Date() + ' | ' + 'Searching clan by tag: #' + req.params.clan_tag);
		let client = clashApi({
		  	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjM2ZTBmYTMyLTFkODUtNGY2ZS04NGUzLTVlYWY0YWZmMmQzNSIsImlhdCI6MTQ1Nzg3OTQ2OCwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjg5LjY1LjU5LjM1IiwiNDYuMjI5LjE1My4xNDYiLCI1LjE5Ni43MS45MSIsIjg5Ljc4LjE5NC4xOTYiXSwidHlwZSI6ImNsaWVudCJ9XX0.9_Vk9dNyMb7rz3zjom1lA3JKQJPS2_JLquFDR3Ml93Qnkme1z14rpi8rOUDsUbvHCJcj8h0-ajxud82ytMx2iA" // Optional, can also use COC_API_TOKEN env variable
		});
		client
			.clanByTag('#' + req.params.clan_tag)
			.then(response => res.send(response))
			.catch(err => res.send({'found': false}));
});

// User profile
router.route('/profile/:profile/:user')
	.post(function(req, res) {
		var profile = JSON.parse(req.params.profile);
		var updateProfile = {
			barGold: profile.barGold,
			barGold_comma: profile.barGold_comma,
			barElixir: profile.barElixir,
			barElixir_comma: profile.barElixir,
			barDarkElixir: profile.barDarkElixir,
			barDarkElixir_comma: profile.barDarkElixir,
			gems: profile.gems
		};
		console.log(new Date() + ' | ' + 'User in request:' + req.params.user);
		Users.findOne({"user": req.params.user}, function(err, user) {
		  if (err) throw err;
		  user.bars = updateProfile;
		  console.log(new Date() + ' | ' + 'Request in db: ' + user.user);
		  user.save(function(err, data) {
		    if (err) throw err;
		    data.password = undefined;
		    res.send(data);
		    console.log(new Date() + ' | ' + 'Profile successfully updated!');
		  });

		});
	});

// Create clan
router.route('/createclan/:clan_register/:leader')
	.post(function(req, res) {
		var randtok = randtoken.generate(4);
		console.log(new Date() + ' | ' + 'clan creation tag: ' + req.params.clan_register);
		let client = clashApi({
		  	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjM2ZTBmYTMyLTFkODUtNGY2ZS04NGUzLTVlYWY0YWZmMmQzNSIsImlhdCI6MTQ1Nzg3OTQ2OCwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjg5LjY1LjU5LjM1IiwiNDYuMjI5LjE1My4xNDYiLCI1LjE5Ni43MS45MSIsIjg5Ljc4LjE5NC4xOTYiXSwidHlwZSI6ImNsaWVudCJ9XX0.9_Vk9dNyMb7rz3zjom1lA3JKQJPS2_JLquFDR3Ml93Qnkme1z14rpi8rOUDsUbvHCJcj8h0-ajxud82ytMx2iA" // Optional, can also use COC_API_TOKEN env variable
		});
		// Checks if the clan tag does exist
		client
			.clanByTag('#' + req.params.clan_register)
			.then(function(response) {
				console.log(new Date() + ' | ' + "Clan tag does exist: " + response.name);
				createClan(response);
				res.send({"token": randtok});
			})
			.catch(function(err) {
				console.log(new Date() + ' | ' + "Clan tag does not exist");
				res.send({found: false});
			});
		// Initializing clan settings
		var createClan = function (res) {
			console.log(new Date() + ' | ' + "Creating clan...");
			var clanModel = new Clans({
				tag: req.params.clan_register,
				name: res.name,
				badge: res.badgeUrls.small,
				members: [
					{ name: req.params.leader , role: 'leader'}
				],
				activated: false,
				activate_token: randtok,
				date_created: new Date()
		});
		// Save model into the database
		clanModel.save(function(error, data) {
		    if (error) {
		        console.log(new Date() + ' | ' + error);
		    }
		    else {
		        console.log(new Date() + ' | ' + data);
		        console.log(new Date() + ' | ' + "Clan was successfully initialized...");
		    }
		});
		}
	});

// Validates clan
router.route('/validateclan/:tag/:token/:leader')
	.post(function(req, res) {
		console.log(new Date() + ' | ' + "Validating clan...");
		Clans.findOne({"tag": req.params.tag}, function(err, clan) {
		let client = clashApi({
	  		token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjM2ZTBmYTMyLTFkODUtNGY2ZS04NGUzLTVlYWY0YWZmMmQzNSIsImlhdCI6MTQ1Nzg3OTQ2OCwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjg5LjY1LjU5LjM1IiwiNDYuMjI5LjE1My4xNDYiLCI1LjE5Ni43MS45MSIsIjg5Ljc4LjE5NC4xOTYiXSwidHlwZSI6ImNsaWVudCJ9XX0.9_Vk9dNyMb7rz3zjom1lA3JKQJPS2_JLquFDR3Ml93Qnkme1z14rpi8rOUDsUbvHCJcj8h0-ajxud82ytMx2iA" // Optional, can also use COC_API_TOKEN env variable
		});
		client
			.clanByTag('#' + req.params.tag)
			.then(function(response){
				if (response.description.indexOf(req.params.token) > -1) {
					// clan.update
					console.log(new Date() + ' | ' + "...Token has been found in description: Clan was successfully created!")
					clan.activated = true;
					clan.activate_token = undefined;
					clan.save(function(err, data) {
						console.log(new Date() + ' | ' + req.params.tag + ' is now activated!');
						linkUserToClan(response);
						res.send({"description": response.description});
					});
				}
				else {
					res.send({"found": false});
					console.log(new Date() + ' | ' + "Failure: Token is not in the description");
				}
			})
			.catch(err => console.log(new Date() + ' | ' + err));
		});
		// Links clan to user
		var linkUserToClan = function(res) {
			Users.findOne({"user": req.params.leader}, function(err, user) {
				user.clan_tag = req.params.tag;
				user.role = 'leader';
				user.clan_name = res.name;
				user.clan_badge = res.badgeUrls.small;
				user.save(function(err, data) {
					console.log(req.params.leader + " successfully created:");
					console.log(user.clan_name + '!');
				});
			});
		};

	});

// Gets clan profile
router.route('/myclan/:tag')
	.get(function(req, res) {
		Clans.findOne({"tag": req.params.tag}, function(err, clan) {
			if (clan)
				res.send(clan);
			else {
				res.send({"message": "No such clan has been found"});
			}
		})
	});

// Gets all clans
router.route('/getAllClans')
	.get(function(req, res) {
		Clans.find(function(err, clan) {
			if (clan)
				res.send(clan);
			else {
				res.send({"message": "No clan have been found"});
			}
		})
	});

// Join your clan
router.route("/joinYourClan/:tag/:name")
	.post(function(req, res) {
		Clans.findOne({"tag": req.params.tag}, function(err, clan) {
			console.log(clan.members);
			clan.member_requests.push(
				{'name': req.params.name, 'date_request': new Date()}
			);
			clan.save(function(err, res) {
				console.log(res);
			});
			res.send(clan);
			Users.findOne({"user": req.params.name}, function(err, user) {
				user.clan_request = true;
				user.save(function(err, res) {
					console.log(req.params.name + ' has requested a clan membership!');
				});
			});
		});
	});

router.route("/acceptMember/:name/:clan_tag/:clan_name")
	.post(function(req, res) {
		Users.findOne({"user": req.params.name}, function(err, user) {
			user.clan_tag = req.params.clan_tag;
			user.role = 'member';
			user.clan_name = req.params.clan_name;
			user.save(function(err, res) {
				console.log("accept member: " + req.params.name);
			});
			// Move requested member to list of members
			var requestToMember = function(name, tag) {
			Clans.findOne({"tag": tag}, function(err, clan) {
				console.log("ON MOVE LE MEMBER");
				clan.members.push(
					{"name": name, "role": 'member'}
				);
				clan.member_requests = _.without(clan.member_requests, _.findWhere(clan.member_requests, {name: name}));
				clan.save(function(err, data) {
					console.log("New member!");
				});
				res.send(clan);
				console.log(">>>>>>>>>>>> Badge");
				console.log(clan.badge);
				Users.findOne({"user": req.params.name}, function(err, user) {
					user.clan_badge = clan.badge;
					user.save(function(err, data) {});
				});
				});
			};
			requestToMember(req.params.name, req.params.clan_tag);
		});
	});

// Refuse member request
router.route("/refuseMember/:name/:clan_tag/:clan_name")
	.post(function(req, res) {
		Users.findOne({"user": req.params.name}, function(err, user) {
			user.clan_request = false;
			user.save(function(err, data) {
			// Then we clean the member request list
			Clans.findOne({"tag": req.params.clan_tag}, function(err, clan) {
				clan.member_requests = _.without(clan.member_requests, _.findWhere(clan.member_requests, {name: req.params.name}));
				clan.save(function(err, data) {
					console.log(req.params.name + ' has been refused from his clan');
					res.send(data);
				});
			});
		});
	});
});

// Save War Clan
router.route("/saveWarClan/:war/:clan_tag")
	.post(function(req, res) {
		console.log(JSON.parse(req.params.war));
		Clans.findOne({"tag": req.params.clan_tag}, function(err, clan) {
			console.log("OOOOOOOOOOOOOOOOOOOOOO");
			console.log(JSON.parse(req.params.war));
			clan.wars.push(
				JSON.parse(req.params.war)
			);
			console.log(clan.wars);
			clan.save(function(err, data) {
				res.send(data);
			});
		});
	});

// Get Clan wars by clan tag
router.route("/getClanWars/:clan_tag")
	.get(function(req, res) {
		Clans.findOne({"tag": req.params.clan_tag}, function(err, clan) {
			console.log(clan);
			var wars = clan.wars;
			res.send(wars);
		});
	});

// Update war
router.route("/updateWar/:war/:clan_tag")
	.post(function(req, res) {
		Clans.findOne({"tag": req.params.clan_tag}, function(err, clan) {
			var currentwar = JSON.parse(req.params.war);
			console.log(currentwar);

			// Get destruction average
			var destruction_average = 0;
			var stars = 0;
			var i = 0;
			_.each(currentwar.participants, function(participant) {
				destruction_average += participant.percentage_1;
				destruction_average += participant.percentage_2;
				stars += participant.attack_1;
				stars += participant.attack_2;
				i = i + 2;

			});
			destruction_average = (destruction_average/i).toFixed(2);

			_.each(clan.wars, function(war, index) {
				var wardb = _.find(war, {id: currentwar.id});
				// console.log(wardb);

				// We update the right one
				if (wardb) {
					clan.wars[index].participants = currentwar.participants;
					clan.wars[index].destruction_average = destruction_average;
					clan.wars[index].stars = stars;
					clan.wars[index].state = currentwar.state;
					console.log(clan.wars[index].destruction_average);
					for (var j = 0; j < clan.wars[index].participants.length; j++) {
						clan.wars[index].participants[j].destruction_average = ((clan.wars[index].participants[j].percentage_1 + clan.wars[index].participants[j].percentage_2) / 2).toFixed(2);
						console.log(clan.wars[index].participants[j].name);
					}
				}
			});
			clan.save(function(err, data) {
				res.send(data);
			});
		});
	});
		
app.use('/api', router, limiter);

app.listen(port);

console.log(new Date() + ' | ' + 'cool port ' + port);
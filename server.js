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
// Models
var Users				= require('./models/users');
var Clans				= require('./models/clans');

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
	console.log("Tentative");
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
        	console.log(users.user);
        	res.json(users);
        }
        else
        	res.json(false);
    });
});

// Signup
router.route('/signup/:username/:password')
	.post(function(req, res) {
		console.log("user name  : " + req.params.username);
		console.log("sha1 passwd: " + sha1(req.params.password));
		var randtok = randtoken.generate(32);
		console.log('Signing up: generating token... ' + randtok);
		var newSubscribed = new Users({
			token: randtok,
			user: req.params.username,
			password: sha1(req.params.password),
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
		        console.log(error);
		    }
		    else {
		    	data.password = undefined;
		        res.json(data);
		        console.log(data);
		    }
		});
	});

// Signin
router.route('/signin/:username/:password')
	.get(function(req, res) {
	Users.findOne({user: req.params.username}).exec(function(err, users) {
        if (err)
            res.send(err);
        if (users.password == sha1(req.params.password)) {
        	users.password = undefined;
        	console.log('Signing in user: ' + req.params.username);
        	res.send(users);
        }
        else {
        	res.json(false);
        }
    });
});

// Clan search
router.route('/searchclan/:name')
	.get(function(req, res) {
		console.log('Searching clan by name: ' + req.params.name);
		// CoC API
		let client = clashApi({
		  	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhiNTBlNzYwLWE4YzUtNDY1ZS04YTg4LTY4ZDljMDgzMGYzMCIsImlhdCI6MTQ1NzM5MzcyNiwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ2LjIyOS4xNTMuMTQ2IiwiNS4xOTYuNzEuOTEiLCI4OS43OC4xOTQuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.WaoOOVg1Wxnnb2PYN2hLA2x1IS6MTCxT9VGl5FbpV_P7NENcC7RoB3geM8u0admc7cRTN62uxh83d5PrxB9A0Q" // Optional, can also use COC_API_TOKEN env variable
		});
		client
			.clans()
			.withName(req.params.name)
			.withLimit(20)
			.fetch()
			.then(response => res.send(response))
			.catch(err => console.log(err));
	});

// Clan profile
router.route('/clan/:clan_tag')
	.get(function(req, res) {
		console.log('Searching clan by tag: #' + req.params.clan_tag);
		let client = clashApi({
		  	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhiNTBlNzYwLWE4YzUtNDY1ZS04YTg4LTY4ZDljMDgzMGYzMCIsImlhdCI6MTQ1NzM5MzcyNiwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ2LjIyOS4xNTMuMTQ2IiwiNS4xOTYuNzEuOTEiLCI4OS43OC4xOTQuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.WaoOOVg1Wxnnb2PYN2hLA2x1IS6MTCxT9VGl5FbpV_P7NENcC7RoB3geM8u0admc7cRTN62uxh83d5PrxB9A0Q" // Optional, can also use COC_API_TOKEN env variable
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
		console.log('User in request:' + req.params.user);
		Users.findOne({"user": req.params.user}, function(err, user) {
		  if (err) throw err;
		  user.bars = updateProfile;
		  console.log('Request in db: ' + user.user);
		  user.save(function(err, data) {
		    if (err) throw err;
		    data.password = undefined;
		    res.send(data);
		    console.log('Profile successfully updated!');
		  });

		});
	});

// Create clan
router.route('/createclan/:clan_register/:leader')
	.post(function(req, res) {
		var randtok = randtoken.generate(4);
		console.log('clan creation tag: ' + req.params.clan_register);
		let client = clashApi({
		  	token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhiNTBlNzYwLWE4YzUtNDY1ZS04YTg4LTY4ZDljMDgzMGYzMCIsImlhdCI6MTQ1NzM5MzcyNiwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ2LjIyOS4xNTMuMTQ2IiwiNS4xOTYuNzEuOTEiLCI4OS43OC4xOTQuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.WaoOOVg1Wxnnb2PYN2hLA2x1IS6MTCxT9VGl5FbpV_P7NENcC7RoB3geM8u0admc7cRTN62uxh83d5PrxB9A0Q" // Optional, can also use COC_API_TOKEN env variable
		});
		// Checks if the clan tag does exist
		client
			.clanByTag(req.params.clan_register)
			.then(function(response) {
				console.log("Clan tag does exist");
				createClan();
				res.send({"token": randtok});
			})
			.catch(function(err) {
				console.log("Clan tag does not exist");
				res.send({found: false});
			});
		// Initializing clan settings
		var createClan = function () {
			console.log("Creating clan...");
			var clanModel = new Clans({
				tag: req.params.clan_register,
				leader: req.params.leader,
				members: [
					{ name: String }
				],
				activated: false,
				activate_token: randtok,
				date_created: new Date()
			});
			// Save model into the database
			clanModel.save(function(error, data) {
			    if (error) {
			        console.log(error);
			    }
			    else {
			        console.log(data);
			        console.log("Clan was successfully created!");
			    }
			});
		}
	});

// Validates clan
router.route('/validateclan/:tag/:token')
	.post(function(req, res) {
		console.log("Validating clan...");
		Clans.findOne({"tag": req.params.tag}, function(err, clan) {
		let client = clashApi({
	  		token: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiIsImtpZCI6IjI4YTMxOGY3LTAwMDAtYTFlYi03ZmExLTJjNzQzM2M2Y2NhNSJ9.eyJpc3MiOiJzdXBlcmNlbGwiLCJhdWQiOiJzdXBlcmNlbGw6Z2FtZWFwaSIsImp0aSI6IjhiNTBlNzYwLWE4YzUtNDY1ZS04YTg4LTY4ZDljMDgzMGYzMCIsImlhdCI6MTQ1NzM5MzcyNiwic3ViIjoiZGV2ZWxvcGVyLzhhODkwMzQzLWU0ZDAtYjlmNS1mNGFjLTljN2FhYTQwNmI1ZCIsInNjb3BlcyI6WyJjbGFzaCJdLCJsaW1pdHMiOlt7InRpZXIiOiJkZXZlbG9wZXIvc2lsdmVyIiwidHlwZSI6InRocm90dGxpbmcifSx7ImNpZHJzIjpbIjQ2LjIyOS4xNTMuMTQ2IiwiNS4xOTYuNzEuOTEiLCI4OS43OC4xOTQuMTk2Il0sInR5cGUiOiJjbGllbnQifV19.WaoOOVg1Wxnnb2PYN2hLA2x1IS6MTCxT9VGl5FbpV_P7NENcC7RoB3geM8u0admc7cRTN62uxh83d5PrxB9A0Q" // Optional, can also use COC_API_TOKEN env variable
		});
		client
			.clanByTag('#' + req.params.tag)
			.then(function(response){
				if (response.description.indexOf(req.params.token) > -1) {
					// clan.update
					console.log("Validation: Token is in the description!")
					clan.activated = true;
					clan.activate_token = undefined;
					clan.save(function(err, data) {
						console.log(req.params.tag + ' is now activated!');
						res.send({"description": response.description});
					});
				}
				else {
					res.send({"found": false});
					console.log("Failure: Token is not in the description");
				}
			})
			.catch(err => console.log(err));
		});
	});

app.use('/api', router, limiter);

app.listen(port);

console.log('cool port ' + port);
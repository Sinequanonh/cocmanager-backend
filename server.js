var express		= require('express');
var app			= express();
var bodyParser 	        = require('body-parser');
var mongoose 	        = require('mongoose');
var randtoken			= require('rand-token');
// var Bear		= require('./models/bear');
// var Shack		= require('./models/noelshack');
var Users		= require('./models/users');

// var db = mongoose.connection;
mongoose.connect('mongodb://127.0.0.1:27017/cocmanager');


// mongoose.connect();
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 8484;

// ROUTES FOR API
// =================================================
var router = express.Router();

router.use(function(req, res, next) {
	res.header('Access-Control-Allow-Origin', "http://localhost");
	res.header('Access-Control-Allow-Origin', "http://127.0.0.1:8080");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
	next();
});

router.get('/', function(req, res) {
	console.log("Tentative");
	res.json({ message: 'Home'});
});

router.route('/galerie/:profile/:sex')
	.get(function(req, res) {
		var message = {
			"profile": req.params.profile,
			"sex": req.params.sex
		};
		console.log(message);
		Users.find({user: message.profile}).exec(function(err, users) {
            if (err)
                res.send(err);
            res.json(users);
        });
});

router.route('/auth/:auth')
.get(function(req, res) {
	console.log(req.params.auth);
	Users.findOne({token: req.params.auth}).exec(function(err, users) {
        if (err)
            res.send(err);
        if (users)
        	res.json(users);
        else
        	res.json(false);
    });
});

router.route('/signup/:username/:password')
	.post(function(req, res) {
		console.log(req.params.username);
		console.log(req.params.password);

		var randtok = randtoken.generate(32);
		console.log(randtok);
		var newSubscribed = new Users({
			token: randtok,
			user: req.params.username, 
			password: req.params.password
		});
		// console.log(newSubscribed);
		newSubscribed.save(function(error, data) {
		    if (error) {
		        res.json(error);
		        console.log(error);
		    }
		    else {
		        res.json(data);
		        console.log(data);
		    }
		});
		// Users.findOne({user: req.params.username}).exec(function(err, users) {
  //           if (err)
  //               res.send(err);
  //           console.log(users.password);
  //           if (users.password == req.params.password) {
  //           	res.send(users);
  //           }
  //           else {
  //           	res.json(false);
  //           }
  //       });
	});

app.use('/api', router);

app.listen(port);

console.log('cool port ' + port);
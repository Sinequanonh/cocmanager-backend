var express		= require('express');
var app			= express();
var bodyParser 	        = require('body-parser');
var mongoose 	        = require('mongoose');
// var Bear		= require('./models/bear');
// var Shack		= require('./models/noelshack');
var Users		= require('./models/users');


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
	res.json({ message: 'salut les copains lol'});
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

router.route('/connexion/:username/:password')
	.get(function(req, res) {
		console.log(req.params.username);
		console.log(req.params.password);
		Users.findOne({user: req.params.username}).exec(function(err, users) {
            if (err)
                res.send(err);
            console.log(users.password);
            if (users.password == req.params.password) {
            	res.json({res: true});
            }
            else {
            	res.json({res: false});
            }
        });
	});

app.use('/api', router);

app.listen(port);

console.log('cool port ' + port);
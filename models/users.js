var mongoose		= require('mongoose');
var Schema			= mongoose.Schema;

var UsersSchema = new Schema({
	token: String,
	user: String,
	password: String,
	bars: {
		barGold: Number,
		barElixir: Number,
		barDarkElixir: Number
	}
}, {collection: 'users'});

module.exports = mongoose.model('Users', UsersSchema);
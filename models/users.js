var mongoose		= require('mongoose');
var Schema			= mongoose.Schema;

var UsersSchema = new Schema({
	token: String,
	user: String,
	password: String,
	bars: {
		barGold: Number,
		barGold_comma: Number,
		barElixir: Number,
		barElixir_comma: Number,
		barDarkElixir: Number,
		barDarkElixir_comma: Number,
		gems: Number
	}
}, {collection: 'users'});

module.exports = mongoose.model('Users', UsersSchema);
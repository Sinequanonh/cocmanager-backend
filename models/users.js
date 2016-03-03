var mongoose		= require('mongoose');
var Schema			= mongoose.Schema;

var UsersSchema = new Schema({
	token: String,
	user: String,
	password: String
}, {collection: 'users'});

module.exports = mongoose.model('Users', UsersSchema);
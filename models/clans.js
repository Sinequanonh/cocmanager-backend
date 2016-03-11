var mongoose		= require('mongoose');
var Schema			= mongoose.Schema;

var ClansSchema = new Schema({
		tag: String,
		members: [
			{ name: String, role: String }
		],
		activated: Boolean,
		activate_token: String,
		date_created: Date
}, {collection: 'clans'});

module.exports = mongoose.model('Clan', ClansSchema);
var mongoose		= require('mongoose');
var Schema			= mongoose.Schema;

var ClansSchema = new Schema({
		tag: String,
		leader: String,
		members: [
			{ name: String }
		],
		activated: Boolean,
		activate_token: Number,
		date_created: Date
}, {collection: 'clans'});

module.exports = mongoose.model('Clan', ClansSchema);
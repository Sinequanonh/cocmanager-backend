var mongoose		= require('mongoose');
var Schema			= mongoose.Schema;

var ClansSchema = new Schema({
		tag: String,
		name: String,
		badge: String,
		members: [
			{ name: String, role: String }
		],
		member_requests: [
			{ name: String },
			{ date_request: Date }
		],
		activated: Boolean,
		activate_token: String,
		date_created: Date,
		wars: [
			{ participants: [{ name: String, attack_1: Number, attack_2: Number }], 
			  show: Boolean , 
			  show_index: Array, 
			  date: Date 
			}
		]
}, {collection: 'clans'});

module.exports = mongoose.model('Clan', ClansSchema);
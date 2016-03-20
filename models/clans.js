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
			{
				id: String,
				participants: [{ name: String, attack_1: Number, percentage_1: Number, attack_2: Number, percentage_2: Number, destruction_average: Number}],
				destruction_average: Number,
				show: Boolean, 
				show_index: Array, 
				date: Date,
				state: String,
				typeofwar: Number,
				stars: Number,
				ennemies: [ { th: Number, position: Number, called_by: String, called_by_stars: Number, best_attack: Number } ],
				strategy: String
			}
		]
}, {collection: 'clans'});

module.exports = mongoose.model('Clan', ClansSchema);
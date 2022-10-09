const mongoose = require('mongoose');


const examinerSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
	},
	department: {
		type: String,
	},
	designation: {
		type: String,
	},
});

module.exports = mongoose.model('Examiner', examinerSchema);

const mongoose = require('mongoose');


const collegeSchema = new mongoose.Schema({
	name: { type: String, trim: true },
	city: { type: String, trim: true },
	state: { type: String, trim: true },
	address: { type: String, trim: true },
	createdAt: { type: Date, default: Date.now },
	modifiedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('College', collegeSchema);

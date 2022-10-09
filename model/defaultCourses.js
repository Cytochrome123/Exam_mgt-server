const mongoose = require('mongoose');


const defaultCourse = new mongoose.Schema({
	name: { type: String, trim: true },
	description: { type: String, required: true, trim: true },
	createdAt: { type: Date, default: Date.now },
	modifiedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('DefaultCourse', defaultCourse);

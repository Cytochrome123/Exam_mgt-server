const mongoose = require('mongoose');



const studentSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	fatherName: { type: String, lowercase: true, required: true },
	motherName: { type: String, lowercase: true, required: true },
	dob: { type: Number, required: true },
	address: { type: String, required: true },
	city: { type: String, required: true },
	state: { type: String, required: true },
	studentId: { type: String, uppercase: true, required: true },
	gender: { type: String, required: true, enum: ['male', 'female', 'others'] },
	createdDate: { type: Number, default: Date.now },
	modifiedDate: { type: Number, default: Date.now },
});

module.exports = mongoose.model('Student', studentSchema);

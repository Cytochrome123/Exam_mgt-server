const mongoose = require('mongoose');


const examinerCourseSchema = new mongoose.Schema({
	examinerId: { type: mongoose.Schema.Types.ObjectId, required: true },
	courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'DefaultCourse' },
	description: { type: String, required: true, trim: true },
	createdDate: { type: Number, default: Date.now },
	modifiedDate: { type: Number, default: Date.now },
	status: {
		type: String,
		default: 'active',
		enum: [ 'active', 'deleted', 'blocked'],
	},
});

module.exports = mongoose.model('ExaminerCourse', examinerCourseSchema);

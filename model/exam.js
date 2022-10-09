const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const examSchema = new Schema({
	examinerId: { type: Schema.Types.ObjectId, required: true },
	subject: { type: String, required: true, index: true },
	course: {
		type: Schema.Types.ObjectId,
		required: true,
		ref: 'ExaminerCourse',
	},
	examCode: { type: String, required: true, index: true },
	password: { type: String, required: true },
	createdDate: { type: Number, default: Date.now },
	modifiedDate: { type: Number, default: Date.now },
	totalMarks: { type: Number, required: true },
	passingMarks: { type: Number, required: true },
	negativeMarks: { type: Number, required: true },
	examDate: { type: Number, required: true },
	startTime: { type: Number, required: true },
	endTime: { type: Number, required: true },
	duration: { type: Number },
	durationStatus: { type: String, required: true },
	status: { type: String, required: true },
	questionId: { type: Schema.Types.ObjectId, required: true },
	examSwitchingAttempts: { type: Number, required: true },
	updatePreviousQuestion: { type: Boolean, required: true },
	shuffleQuestions: { type: Boolean, required: true },
});

module.exports = mongoose.model('Exam', examSchema);

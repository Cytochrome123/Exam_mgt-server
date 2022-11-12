const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const statusEnum = [
	'active',
	'blocked',
	'deleted',
	'submitted',
];

const examQuestionMarkings = [
	'not-visited',
	'attempted',
	'not-attempted',
	'attempted and marked for review',
	'not-attempted and marked for review',
];

const assignSchema = new Schema({
	studentId: { type: Schema.Types.ObjectId, required: true },
	examId: { type: Schema.Types.ObjectId, required: true },
	examinerId: { type: Schema.Types.ObjectId, required: true },
	status: { type: String, enum: statusEnum, default: statusEnum[0] },
	createdDate: { type: Number, default: Date.now },
	modifiedDate: { type: Number, default: Date.now },
	marksObtained: { type: Number, default: 0 },
	attemptedQuestionsCount: { type: Number, default: 0 },
	correctAnswerCount: { type: Number, default: 0 },
	// questonsMarking --- change to
	answerMarkings: {
		type: [
			{
				questionId: { type: Schema.Types.ObjectId },
				status: { type: String, enum: examQuestionMarkings },
			},
		],
		default: [],
	},
	windowSwitchAttempts: { type: Number, default: 0 },
});

module.exports = mongoose.model('Assign', assignSchema);

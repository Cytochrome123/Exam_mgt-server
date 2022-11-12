const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const answerSchema = new Schema({
	userId: { type: Schema.Types.ObjectId, required: true },
	examId: { type: Schema.Types.ObjectId, required: true },
	questionId: { type: Schema.Types.ObjectId, required: true },
	// answer: { type: String },
	answer: [ String ],
	// correct: { type: Boolean, required: true },
	createdDate: { type: Number, default: Date.now },
	modifiedDate: { type: Number, default: Date.now },
	status: { 
        type: String, 
        required: true, 
        enum: [ 'ATTEMPTED', 'CLEARED', 'REVIEW' ] 
    },
});

module.exports = mongoose.model('Answer', answerSchema);
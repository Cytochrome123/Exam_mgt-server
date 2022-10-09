const mongoose = require("mongoose");
// const passportLocalMongoose = require("passport-local-mongoose")


const userTypeEnum = [ 'admin', 'subAdmin', 'examiner', 'student' ];
const accountTypeEnum = [ 'pending', 'declined', 'approved', 'active', 'deleted', ]

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true, lowercase: true, index: true },
	lastName: { type: String, required: true, lowercase: true, index: true },
	email: { type: String, required: true },
	password: { type: String, default: null },
	phoneNumber: { type: String, required: true },
	userType: { type: String, required: true, enum: userTypeEnum },
	lastLogin: { type: Number, default: null },
	status: { type: String, required: true, enum: accountTypeEnum },
	createdDate: { type: Number, default: Date.now },
	modifiedDate: { type: Number, default: Date.now },
	collegeId: { type: mongoose.Schema.Types.ObjectId, default: null, ref: 'College' },
	subAdmin: [
		{ type: mongoose.Schema.Types.ObjectId, default: null }
	],
	image: { type: mongoose.Schema.Types.ObjectId, default: null },

})

// userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema);
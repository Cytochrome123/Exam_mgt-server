const mongoose = require('mongoose');
const moment = require('moment');

const {queries} = require('../db');
const {factory} = require('../config');
const {Exam, ExaminerCourse} = require('../model');

class Exams {
    getAllExams = async (my_details) => {
        try {
            let condition = { examinerId: mongoose.Types.ObjectId(my_details._id)};
            let projection = {
                examinerId: 1,
                subject: 1,
                password: 1,
                createdDate: 1,
                modifiedDate: 1,
            };
            let option = { lean: true };
            let populateOptions = {
                path: 'course',
                // select
            }

            const examDetails = await queries.populateData(Exam, condition, projection, option, populateOptions);

            const examCount = await queries.countDocuments(Exam, condition);

            condition = {
                $and: [
                    { examinerId: mongoose.Types.ObjectId(my_details._id) },
                    { status: 'active'}
                ]
            }

            const courseCount = await queries.countDocuments(ExaminerCourse, condition);

            return {
                status: 200,
                data: { msg: 'Compiled', examDetails, examCount, courseCount }
            };

        } catch(err) {
            throw err;
        }
    };

    createExam = async (my_details, examDetails) => {
        try {
            let examData = {
                examinerId: my_details._id,
                subject: examDetails.subject,
                course: examDetails.course,
                examCode: examDetails.examCode,
                password: factory.generateHashPassword(examDetails.password),
				totalMarks: parseInt(examDetails.totalMarks, 10),
				passingMarks: parseInt(examDetails.passingMarks, 10),
				negativeMarks: examDetails.negativeMarks,
				examDate: moment(examDetails.examDate).valueOf(),
				startTime: moment(examDetails.startTime).valueOf(),
				endTime: moment(examDetails.endTime).valueOf(),
				durationStatus: examDetails.hideDuration
					? 'complete'
					: 'selective',
				status: 'created',
            };

            if (!examDetails.hideDuration) {
				saveData.duration = parseInt(examDetails.duration, 10);
			};

            await queries.create( Exam, examData );

            return {
                status: 200,
                data: { msg: 'Exam creation successfull!'}
            }
        } catch(err) {
            throw err;
        }
    };

    viewExam = async (my_details, examId) => {
        try {
            let condition = { 
                $and: [
                    { _id: examId },
                    { examinerId: my_details._id }
                ]
             };
            let projection = {
                password: 0,
            };
            let option = { lean: true };
            // Should it be an ARRAY???
            let populateOptions = {
                path: 'course',
                select: '_id courseId',

                populate: {
                    path: 'courseId',
                    select: 'name',
                    model: 'DefaultCourse' 
                },

                model: 'ExaminerCourse'
            };

            let examDetails = await queries.populateData( Exam, condition, projection, option, populateOptions);

            if(examDetails) {
                return {
                    status: 200,
                    data: {
                        msg: 'Exam details available',
                        examDetails
                    }
                }
            }
            return {
                status: 400,
                data: {
                    msg: 'Failed to load Exam details'
                }
            }

        } catch(err) {
            throw err;
        }
    };

    updateExam = async (examId, updateDetails) => {
        try {
            let condition = { _id: examId };

            let options = {
                new: true,
                fields: {
                    // CHeck again when building the frontend -----
                    password: 0,
                    examinerId: 0,
                    status: 0
                }
            };

            if (updateDetails.duration) {
				if (updateDetails.hideDuration) {
					toUpdate.durationStatus = 'complete';
					toUpdate.duration = null;
				} else {
					toUpdate.durationStatus = 'selective';
					toUpdate.duration = updateDetails.duration;
				}
			}

            let updatedExam = await queries.findByIdAndUpdate( Exam, condition, updateDetails, options );

            if(updatedExam) {
                return {
                    status: 200,
                    data: { msg: 'Exam updated successfully'}
                }
            }
            return {
                status: 401,
                data: { msg: 'Invalid Id' }
            }
        } catch(err) {
            throw err;
        }
    };

    deleteExam = async (examId) => {
        try {
            let condition = { _id: examId };
			let update = { status: 'deleted' };
			let option = { new: true };

			let updatedExam = await queries.findByIdAndUpdate( Exam, condition, update, option );

			if (updatedExam) {
				return {
					status: 200,
					data: { msg: 'Exam set as deleted' }
				};
			} else {
				return {
					status: 400,
					data: { msg: 'Invalid exam id' }
				};
			}
        } catch {
            throw err;
        }
    }
}

module.exports = new Exams();
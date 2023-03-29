// const { default: mongoose } = require("mongoose");
const mongoose = require("mongoose");
const moment = require('moment');
const { queries } = require("../db");
const { User, Exam, Assign, Question, Answer } = require("../model");

const student = {
    getExams: async (my_details) => {
        try {
            let startOfMonth = moment().startOf('month').valueOf();
			let endOfMonth = moment().endOf('month').valueOf();
            console.log(startOfMonth)
            let aggregatePipeline = [
                { $match: { studentId: mongoose.Types.ObjectId(my_details._id) } },
                {
                    $lookup: {
                        from: 'exams',
                        // localField: '_id',
                        // foreignField: 'course',
                        let: { examId: '$examId' },
						pipeline: [
							{
								$match: {
									$expr: {
										$and: [
											{ $eq: ['$_id', '$$examId'] },
											// { $gte: ['$examDate', startOfMonth] },
											// { $lte: ['$examDate', endOfMonth] },
										],
									},
								},
							},
						],
                        as: 'allExams'
                    }
                },
                { $unwind: '$allExams' },
                {
                    $project: {
                        status: 1,
                        // examId: 1,
                        marksObtained: 1,
                        attemptedQuestionsCount: 1,
                        correctAnswerCount: 1,
						'allExams._id': 1,
						'allExams.examDate': 1,
						'allExams.course': 1,
                        'allExams.subject': 1,
						'allExams.examCode': 1,
                    }
                }
            ];

            let populateOptions = 
                {
                    path: 'allExams.course',
                    select: '_id courseId',
                    populate: {
                        path: 'courseId',
                        select: 'name',
                        // model: 'defaultCourses',
                    },
                    // model: 'examinerCourses'
                }
            ;

            const allExams = await queries.aggregateDataAndPopulate( Assign, aggregatePipeline, populateOptions );
            // console.log(Object.values(allExams))
            let startOfDay = Date.now();
            let endOfDay = moment().endOf('day').valueOf();
            // const end = new Date(2020, 1, 1, 1, 1);
            // end.setUTCHours(23, 59, 59, 999);
            
            let todaySExams = [];
            let conductedExams = [];
            let upcomingExams = [];
            for (let details of allExams) {
                let examDate = details.allExams.examDate;
                if (examDate >= startOfDay && examDate >= endOfDay) {
                    todaySExams.push(details)
                } else if (examDate <= startOfDay) {
					conductedExams.push(details);
				} else upcomingExams.push(details);
            }
            return {
                status: 200,
                data: { msg: 'All available exam sorted' , todaySExams, conductedExams, upcomingExams, allExams}
            };
        } catch (err) {
            throw err;
        }
    },

    getExamQuestion: async (my_details, examId, questionNum) => {
        try {
            let conditions = {
                $and: [
                    { studentId: mongoose.Types.ObjectId(my_details._id) },
                    { examId: mongoose.Types.ObjectId(examId) }
                ]
            }
            let projection = {
                status: 1,
                answerMarkings: 1,
                attemptedQuestionsCount: 1
            };
            let options = { lean: true }

            const assignedExam = await queries.findOne( Assign, conditions, projection, options )

            if (assignedExam) {
                conditions = {
                    $and: [
                        { examId: mongoose.Types.ObjectId(examId) },
                        { status: 'active'}
                    ]
                }

                

                projection = {
                    correctAnswer: 0,
                    examId: 0,
                    examinerId: 0,
                    createdDate: 0,
                    modifiedDate: 0,
                };

                options = {
                    skip: questionNum,
                    // skip: 14,
                    lean: true,
                    // limit: 1
                }

                let question = await queries.findOne( Question, conditions, projection, options );


                if (question) {
                    conditions = {
                        $and: [
                            { studentId: mongoose.Types.ObjectId(my_details._id) },
                            { examId: mongoose.Types.ObjectId(examId) },
                            { 
                                'answerMarkings.questionId': mongoose.Types.ObjectId(question._id),
                                'answerMarkings.status': {
                                    $nin: [
                                        'attempted',
                                        'attempted and marked for review',
                                        'not-attempted and marked for review'
                                    ]
                                }
                            }
                        ]
                    };

                    let update = { 'answerMarkings.status': 'not-attempted' };
                    options = { lean: true, new: true };

                    await queries.findOneAndUpdate( Assign, conditions, update, options );

                    conditions = {
                        $and: [
                            { userId: mongoose.Types.ObjectId(my_details._id) },
                            // { examId: mongoose.Types.ObjectId(assignedExam._id) },
                            { examId: mongoose.Types.ObjectId(examId) },
                            { questionId: mongoose.Types.ObjectId(question._id) },
                        ]
                    };

                    projection = { answer: 1 };
                    options = { lean: true };

                    const existingAnswer = await queries.findOne( Answer, conditions, projection, options );
                    return {
                        status: 200,
                        data: { assignedExam, question, existingAnswer }
                    }

                } else {
                    return {
                        status: 401,
                        data: { msg: 'No question for this exam yet!'}
                    }
                }

                
            }
            return {
                status: 201,
                data: { assignedExam }
            }
        } catch (err) {
            throw err;
        }
    },
    
    saveAnswer: async (my_details, payload) => {
        try {
            let conditions = { _id: mongoose.Types.ObjectId(payload.questionId) }
            let projections = {};
            let options = { lean: true };

            const question = await queries.findOne( Question, conditions, projections, options );

            if (question) {
                conditions = {
                    $and: [
                        { userId: mongoose.Types.ObjectId(my_details._id) },
						{ examId: payload.examId },
						{ questionId: payload.questionId },
                    ]
                };

                const answerExists = await queries.findOne( Answer, conditions, projections, options );

                if (!answerExists) {
                    const newAnswer = {
                        userId: my_details._id,
                        examId: payload.examId,
                        questionId: payload.questionId,
                        answer: payload.answer,
                        status: payload.status
                    };

                    await queries.create( Answer, newAnswer );

                    return {
                        status: 200,
                        msg: 'Answer saved'
                    }
                } else {
                    const update = { answer: payload.answer };

                    const updated = await queries.update( Answer, answerExists._id, update, options )
                    if(updated) {
                        return {
                            status: 200,
                            msg: 'Answer updated'
                        }
                    }
                    return {
                        status: 401,
                        msg: 'Couldn\'t update answer'
                    }
                }
            } else {
                return {
                    status: 404,
                    msg: 'Invalid Question'
                }
            }
        } catch (err) {
            throw err;
        }
    },

    submitExam: async (my_details, payload) => {
        try {
            // let condition  = { examId: mongoose.Types.ObjectId(payload.id) };
            // let projection = { id: 1 };
            let options = { lean: true };

            // const exam = await queries.findOne( Assign, condition, projection, options );

            let aggregatePipeline = [
                {
                    $match: {
                        $and: [
                            { userId: mongoose.Types.ObjectId(my_details._id) },
                            // { examId: mongoose.Types.ObjectId(exam._id) },
                            { examId: mongoose.Types.ObjectId(payload.id) }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'questions',
                        localField: 'questionId',
                        foreignField: '_id',
                        as: 'questionData'
                    }
                },
                { $unwind: '$questionData' },
                {
                    $lookup: {
                        from: 'exams',
                        localField: 'examId',
                        foreignField: '_id',
                        as: 'examData'
                    }
                },
                { $unwind: '$examData' },
                {
                    $project: {
                        status: 1,
						answer: 1,
						'questionData.correctAnswer': 1,
						'questionData.questionMark': 1,
						'questionData.optionType': 1,
						'examData.negativeMarks': 1,
                    }
                }
            ];

            

            let answers = await queries.aggregateData( Answer, aggregatePipeline, options );

            console.log(answers);

            let marksObtained = 0;
            let correctAnswerCount = 0;
            let wrongAnswerCount = 0;
            let attemptedQuestionsCount = 0;

            answers.forEach((answer, index) => {
                
                if (answer.status === 'ATTEMPTED') attemptedQuestionsCount++;
    
                if (answer.questionData.optionType === 'single') {
    
                    if (answer.answer[0] === answer.questionData.correctAnswer[0]) {
                        marksObtained += answer.questionData.questionMark;
                        correctAnswerCount++;
                        // console.log('çalculating');
                    } else {
                        marksObtained -= answer.examData.negativeMarks;
                        wrongAnswerCount++;
                        // console.log('not çalculating');
                    }
                } else {
                    let included = 0;
                    answer.questionData.correctAnswer.forEach(correct => {
                        if (answer.answer.includes(correct)) {
                            included++;

                        }
                    })
                    // console.log(included)
                    if (included === answer.questionData.correctAnswer.length) {
                        marksObtained += answer.questionData.questionMark;
                        correctAnswerCount++;
                        // console.log('multi-çalculating');
                    } else {
                        marksObtained -= answer.examData.negativeMarks;
                        wrongAnswerCount++;
                        // console.log('mnot çalculating');
                    }
                }
            })

            let condition = {
				$and: [
					{ examId: mongoose.Types.ObjectId(payload.id) },
					{ studentId: mongoose.Types.ObjectId(my_details._id) },
				],
			};

            let update = {
				status: 'submitted',
				marksObtained: marksObtained,
				correctAnswerCount: correctAnswerCount,
                wrongAnswerCount: wrongAnswerCount,
				attemptedQuestionsCount: attemptedQuestionsCount,
				modifiedDate: Date.now(),
			};

            options = { lean: true, new: true };

            const updated = await queries.findOneAndUpdate( Assign, condition, update, options);

            if (updated) {
                return {
                    status: 200,
                    data: { msg: 'Submitted'}
                }
            } else {
                return {
                    status: 200,
                    data: { msg: 'Invalid Exam Id'}
                }
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = student;
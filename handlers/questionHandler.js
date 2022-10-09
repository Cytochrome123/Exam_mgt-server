const mongoose = require('mongoose');

const { queries } = require("../db");
const { Exam, Question } = require("../model");


const question = {
    addNewQuestion: async (my_details, questionData) => {
        try {
            console.log(questionData.examId)
            let conditions = { _id: questionData.examId };
            let projections = { totalMarks: 1 };
            let options = { lean: true };

            const examDetails = await queries.findOne( Exam, conditions, projections, options );


            let aggregatePipeline = [
                { $match: { examId: mongoose.Types.ObjectId(questionData.examId) } },
                {
                    $group: { _id: '$examId', examMark: { $sum: '$questionMark'} }
                }
            ];

            let questionDetails = await queries.aggregateData( Question, aggregatePipeline );
console.log(questionDetails)
            const queData = {
                examinerId: my_details._id,
                examId: questionData.examId,
				question: questionData.question,
				description: questionData.description
					? questionData.description
					: null,
				questionMark: questionData.questionMark,
				optionType: questionData.optionType,
                correctAnswer: questionData.optionsList,
				options: questionData.optionsList,
				status: 'active'
            };

            // if(questionDetails.length !== 0) {
            //     if (questionDetails[0].examMark + parseInt(questionData.questionMark) > examDetails.totalMarks ) {
            //         return {
            //             status: 400,
            //             data: { msg: 'Total Marks exceeded !!!'}
            //         }
            //     }
            // }

            if (
                    questionDetails.length !== 0 && 
                    questionDetails[0].examMark + parseInt(questionData.questionMark) > examDetails.totalMarks
            ) {
                return {
                    status: 400,
                    data: { msg: 'Total Marks exceeded !!!'}
                }
            } else {
                await queries.create( Question, queData );
console.log('created')
                questionDetails = await queries.aggregateData( Question, aggregatePipeline );

                let update; 

                if (questionDetails[0].examMark + parseInt(questionData.questionMark) === examDetails.totalMarks) {
                    update = {
                        $set: {
                            status: 'active',
                            updatedDate: new Date()
                        }
                    };
                    await queries.findOneAndUpdate( Exam, conditions, update, options );

                } else if (questionDetails[0].examMark + parseInt(questionData.questionMark) < examDetails.totalMarks) {
                    update = {
                        $set: {
                            status: 'Incomplete',
                            updatedDate: new Date(),
                        },
                    }
                    await queries.findOneAndUpdate( Exam, conditions, update, options );

                    
                }

                return {
                    status: 400,
                    data: { msg: 'Question created !!!'}
                }
            }


        } catch (err) {
            throw err;
        }
    },

    viewExamQuestions: async (my_details, examId) => {
        try {
            let condition = {
                examId: mongoose.Types.ObjectId(examId)
            };
            let projections = {};
            let option = { lean: true };
            
            const questions = await queries.find( Question, condition, projections, option );

            const count = await queries.countDocuments( Question, condition );

            projections = { totalMarks: 1, examDate: 1, startTime: 1 };

            const examDetails = await queries.findOne( Exam, condition, projections, option );

            return {
                status: 200,
                data: { msg: 'Questions compiled !!!', questions, count, examDetails }
            };

        } catch (err) {
            throw err;
        }
    },

    viewEachQuestion: async (id) => {
        try {
            let condition = {
                _id: mongoose.Types.ObjectId(id)
            };
            let projections = {};
            let option = { lean: true };
            
            const question = await queries.findOne( Question, condition, projections, option );

            return {
                status: 200,
                data: { msg: 'Question details available !!!', question }
            };
        } catch (err) {
            throw err;
        }
    }
}

module.exports = question
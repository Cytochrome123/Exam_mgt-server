const { questionHandler } = require('../handlers');

const question = {
    addNewQuestion: async (req, res) => {
        try {
            const my_details = req.user;
            const questionData = req.body;

            const response = await questionHandler.addNewQuestion(my_details, questionData);

            res.status(response.status).json(response.msg);
        } catch (err) {
            throw err;
        }
    },

    viewExamQuestions: async (req, res) => {
        try {
            const my_details = req.user;
            const { examId } = req.params;

            const response = await questionHandler.viewExamQuestions(my_details, examId);

            res.status(response.status).json({...response.data});
        } catch (err) {
            throw err;
        }
    },

    viewEachQuestion: async (req, res) => {
        try {
            const {id} = req.params;

            const response = await questionHandler.viewEachQuestion(id);

            res.status(response.status).json({...response.data});
        } catch (err) {
            throw err;
        }
    }
}

module.exports = question;
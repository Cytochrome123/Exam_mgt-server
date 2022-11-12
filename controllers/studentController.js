const { studentHandler } = require("../handlers");

const student = {
    
    getExams: async (req, res) => {
        try {
            const my_details = req.user;
            console.log(my_details)

            const response = await studentHandler.getExams(my_details);

            res.status(200).json({...response.data})
        } catch (err) {
            throw err;
        }
    },

    getExamQuestion: async (req, res) => {
        try {
            const my_details = req.user;
            const { id } = req.params;
            console.log(req.params)
            const { questionNum } = req.query
            // console.log(req.query)
            // console.log(req.params)

            // const payload = {...req.params, ...req.query}
            // console.log(payload);

            const response = await studentHandler.getExamQuestion(my_details, id, questionNum);

            res.status(response.status).json({...response.data})

        } catch (err) {
            throw err;
        }
    },

    saveAnswer: async (req, res) => {
        try {
            const my_details = req.user;
            const payload = req.body

            const response = await studentHandler.saveAnswer(my_details, payload);

            res.status(response.status).json(response.msg);
        } catch (err) {
            throw err;
        }
    },

    submitExam: async (req, res) => {
        try {
            const my_details = req.user;
            const payload = req.params;

            const response = await studentHandler.submitExam(my_details, payload);

            res.status(response.status).json(response.data.msg);
        } catch (err) {
            throw err;
        }
    }
}

module.exports = student
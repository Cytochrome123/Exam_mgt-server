const { adminHandler } = require('../handlers');

const admin = {
    getDashboardDetails: async (req,res) => {
        try {
            let response = await adminHandler.getDashboardDetails();

            console.log(response);
            let fullData = { msg: response.msg, ...response.data}
            console.log(fullData)
            res.status(response.status).json(fullData);

        } catch (err) {
            throw err;
        }
    },

    getSubAdminData: async (req,res) => {
        try {

            // let response = await adminHandler.getSubAdminData();

            let payload = req.query;
			let response = await adminHandler.getSubAdminData(payload);

            const fullData = { msg: response.msg, ...response.data}
            res.status(response.status).json(fullData)
        } catch (err) {
            throw err;
        }
    },

    getExaminerData: async (req, res) => {
        try {
            let response = await adminHandler.getExaminerData()
            // console.log(response);

            const fullData = {msg: response.msg, ...response.data}
            res.status(response.status).json(fullData);
        } catch (err) {
            throw err;
        }
    },

    updateStatus: async (req, res) => {
        try {
            const updating = req.body
            console.log(req.body)

            let response = await adminHandler.updateStatus(updating);
            console.log(response);

        } catch (err) {
            throw err;
        }
    }
}

module.exports = admin;
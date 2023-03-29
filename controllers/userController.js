const {userHandler} = require("../handlers");

const user = {
    saveUserDetails: async (req,res) => {
        try {
            const userData = req.body;
            let response = await userHandler.saveUserDetails(userData);
            
            res.status(response.status).json(response.data)
            
        } catch (err) {
            throw err
        }
    },

    loginUser: (req,res,next) => {
        try {
            const userData = req.body;
            let response = userHandler.loginUser(req,res,next);
            // console.log(userData)
            console.log(response + '****')
            console.log(req.isAuthenticated())
            console.log(req.user)

            return response;
        } catch(err) {
            throw err;
        }
    },

    getCollegeList: async (req,res) => {
        try {
            let response = await userHandler.getCollegeList();
            console.log(response.status);
            res.status(response.status).json(response.data)
        }
        catch(err) {
            throw err;
        }
    }
}

module.exports = user
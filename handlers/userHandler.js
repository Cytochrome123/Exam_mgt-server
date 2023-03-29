const passport = require('passport');

const {queries} = require('../db');
const {User, College} = require('../model');
const auth = require('../auth');
const { factory } = require('../config');

const user = {
    saveUserDetails: async (userData) => {
        try {
            let condition = {
                email: userData.email
            }
            let options = {lean: true}

            let existingUser = await queries.findOne(User, condition, false, options);
            if(!existingUser) {
                userData.password = factory.generateHashPassword(userData.password);
                userData.userType = 'subAdmin';
                userData.status = 'pending';
                userData.collegeId = userData.college;

                await queries.create(User, userData);
                return {
                    status: 200,
                    data: {msg: 'Your acc will be created soon, just a few more steps to complete.'}
                }
            }
            return {
                status: 400,
                data: { msg: 'User already exists!'}
            }
        } catch (err) {
            throw err;
        }
    },

    loginUser: (req,res,next) => {
        
        passport.authenticate('local', (err, user, info) => {
            // if (err) return next(err);
            if (err) throw err;

            if (!user) {
                
                // res.send("User doesn't exist")
                return res.status(400).json({ msg: info.msg });
            }

            req.logIn(user, (err) => {
                if (err) throw err;
                let token = auth.token.createToken(user);
                res.status(200).json({
                	token: token,
                	userType: user.userType,
                	lastLogin: user.lastLogin,
                });
            });

            
        })(req,res,next)
    },

    getCollegeList: async () => {
        try {
            let projection = {name: +1};
            const collegeList = await queries.find(College, {}, projection, {lean:true})
            if (collegeList) {
                return {
                    status: 200,
                    data :  {msg: 'College list compiled!', collegeList}
                }
            } else {
                throw err;
            }
        } catch (err) {
            throw err;
        }
    }
}

module.exports = user;
const passport = require('passport');

const {queries} = require('../db');
const {User, College} = require('../model');
const auth = require('../auth');
const { factory } = require('../config');

const user = {
    saveUserDetails: async (userData) => {
        try {
            console.log("from userHandler!!!");
            console.log(userData)
            let condition = {
                email: userData.email
            }
            let options = {lean: true}

            let existingUser = await queries.findOne(User, condition, false, options)
            // .then(data => {
            //     console.log(data);

            // })
            // .catch(e => console.log(e));

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
            console.log('err');
            throw err;
        }
    },

    loginUser: (req,res,next) => {
        
        passport.authenticate('local', (err, user, info) => {
            // if (err) return next(err);
            if (err) throw err;

            if (!user) {
                console.log(user + '1')
                console.log(info)
                
                // res.send("User doesn't exist")
                return res.status(400).json({ msg: info.msg });
            }

            req.logIn(user, (err) => {
                if (err) throw err;
                let token = auth.token.createToken(user);
                
                // console.log(req.user)
                // console.log(req.isAuthenticated())
                // return res.status(200).json(user)
                // res.status(200).json({
                //     msg: 'Logged In',
                //     data: user
                // })
                // res.send(token)
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
            // .then(collegeList => {
                // console.log(collegeList)
                // return {
                //     status: 500,
                //     data :  {msg: 'College list compiled!', collegeList}
                // }
            // })
            // .catch(err => {
            //     throw err
            // })

            // return {
            //     status: 200,
            //     data :  {collegeList}
            // }

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
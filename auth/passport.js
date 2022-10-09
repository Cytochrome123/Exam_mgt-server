// const passport =  require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const mongoose = require('mongoose');


// const user = require('../model')
const {User} = require('../model');
const {queries} = require('../db');
const {factory} = require('../config');


const comparePassword = async (typedPassword, user, done) => {
    let isSame = factory.compareHashedPassword(typedPassword, user.password);

    // let isSame = true;

    if(isSame) {
        let update = { lastLogin: 100 };

        await queries.update(User, {_id: user._id}, update, {lean: true});
        return done(null, user);
    } else {
        return done(null, false, {msg: 'Incorrect password!!'});
    }
};



// const passportStrategy = ()

module.exports = (passport) => {
    // passport.use(new LocalStrategy(User.authenticate()));
    passport.use(
        new LocalStrategy(
            {
                usernameField: 'email',
                passwordField: 'password'
            }, 
            async (email, password, done) => {
            try {
                console.log(email +' **')
                let condition = { email };
                let projection = {
                    firstName:1,
                    lastName:1,
                    email:1,
                    userType: 1,
                    status: 1,
                    password:1
                }
                let options = {lean :true}
                let user = await queries.findOne(User,condition,projection, options)
                // .then(u => console.log(u))
                // .catch(err => {return done(err)})

                
                if (user){
                    if (user.userType == 'examiner' || user.userType == 'subAdmin'){
                        if (user.status == 'pending'){
                            return done( null, false, {msg: 'Your account is not yet approved'} );
                        }
                        else if (user.status == 'declined'){
                            return done( null, false, {msg: 'Your account has been declined'})
                        }
                        else {
                            comparePassword(password, user, done);
                        }
                    }else if (user.userType == 'student' || user.userType == 'admin') {
                        comparePassword(password, user, done);
                        // return done( null, user)
                    }else {
                        console.log("couldn't determine useertype")
                    }
                } else {
                    return done(null, false, {msg: 'Incorrect credentials'});
                }
            } catch (err){
                throw err;
            }
        })
    );

    passport.serializeUser((user, done) => {
		done(null, toString(user._id));
	});

    passport.use(
		new JwtStrategy(
			{
				jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken('Authorization'),
				secretOrKey: process.env.JWT_SECRET,
			},
			async (jwtPayload, done) => {
				let query = { _id: mongoose.Types.ObjectId(jwtPayload.userId) };
				let projections = { userType: 1, collegeId: 1, subAdmin: 1 };
				let options = { lean: true };

				let user = await queries.findOne(
					User,
					query,
					projections,
					options
				);

				if (user && user.userType === jwtPayload.role) {
                    // req.user = user
					return done(null, user);
				} else {
					return done(null);
				}
			}
		)
	);
}
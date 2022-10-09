const jwt = require('jsonwebtoken');

const createToken = (userData) => {
    // let private = process.env.JWT_SECRET;
    let private = 'hud';
    let userObj = {
        firstName: userData.firstName,
		lastName: userData.lastName,
        userId: userData._id,
        role: userData.userType,
    }

    const token = jwt.sign(userObj, private);
    return token;
}

module.exports = {createToken};
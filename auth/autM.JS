const express = require('express');
const passport = require('passport');
const router = express.Router(); 

router.all('*', (req, res, next) => {
	passport.authenticate('jwt', { session: false }, (err, user, info) => {
		if (!req.headers.authorization) {
			res.status(401).send({ msg: 'Missing authentication' });
		} else if (err || !user) {
			res.status(401).send({ msg: 'Invalid token' });
		} else {
			req.user = user;
			next();
		}
	})(req, res, next);
});

module.exports = router;

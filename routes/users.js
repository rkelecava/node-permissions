var express = require('express');
var router = express.Router();

/*Require mongoose, so that our routes can access our db */
var mongoose = require('mongoose');

/* Require passport and express-jwt for authentication */
var passport = require('passport');
var jwt = require('express-jwt');

/*Include the User mongoose model that our users routes will be using
to access our db */
var User = mongoose.model('User');

/****************************/
/* Middleware */
/*****************************/

// Middleware to check for authenticated JWT and get the payload
var auth = jwt({
	secret: process.env.JWT_SECRET,
	userProperty: 'payload'
});

// Middleware to check if a user has admin permissions
var checkAdmin = function (req, res, next) {

	/* Loop through the user roles from the JWT payload 
	if 'admin' role is found, continuing moving forward.
		If not, return error w/ status 401 */
	for (var i=0; i<req.payload.roles.length; i++) {
		if (req.payload.roles[i]=='admin') {
			return next();
		}
	}

	var err = new Error('You do not have the required permissions to access this route');
	err.status = 401;
	return next(err);
};

// Middleware to check if a user has user permissions
var checkUser = function (req, res, next) {

	/* Loop through the user roles from the JWT payload 
	if 'user' or 'admin' role is found, continuing moving forward.
		If not, return error w/ status 401 */
	for (var i=0; i<req.payload.roles.length; i++) {
		if (req.payload.roles[i]=='admin' || req.payload.roles[i]=='user') {
			return next();
		}
	}

	var err = new Error('You do not have the required permissions to access this route');
	err.status = 401;
	return next(err);
};

/************************/
/* End of Middleware */
/************************/

/************************/
/* Routes */
/************************/

/*************************/
/* Route to test user permissions.
User must be authenticated AND they must have 'admin' permission
to access the route */
/*************************/
router.get('/testAdmin', auth, checkAdmin, function (req, res, next) {
	res.json({message: 'If you see this, you are authenticated w/ admin permissions', username: req.payload.username, id: req.payload._id, roles: req.payload.roles });
});

/*************************/
/* Route to test user permissions.
User must be authenticated AND they must have at least 'user' permission
to access the route */
/*************************/
router.get('/testUser', auth, checkUser, function (req, res, next) {
	res.json({message: 'If you see this, you are authenticated w/ at least user permissions', username: req.payload.username, id: req.payload._id, roles: req.payload.roles });
});

/*********************/
/* GET all users. */
/*********************/
router.get('/', function(req, res, next) {
	// Query db using mongoose find method
	User.find( function (err, users) {
		// Return any errors
		if (err) { return next(err); }
		// If there are no errors, return the list of users
		return res.json(users);
	});
});

/********************/
/* POST a new user */
/********************/
router.post('/', function (req, res, next) {
	// Define a new user model
	var user = new User();

	// Set username = username from form
	user.username = req.body.username;

	// Set password = encrypt password from form using setPassword method defined in User schema
	user.setPassword(req.body.password);

	// Add role from form to user roles array
	if (req.body.role) { user.roles.push(req.body.role); }

	// Save user to db using mongoose save method
	user.save(function (err) {
		// Return any errors
		if (err) { return next(err); }

		/* If no errors, generate a new JWT(jsonwebtoken) for the
		newly added user using the generateJWT method defined in the User Schema */
		return res.json({token: user.generateJWT()});
	});
});

/*****************************************
/* Middleware to PRELOAD "User" Object.
Define a new route parameter for :user */
/******************************************/
router.param('user', function (req, res, next, id) {

	// Define a new query to search for user by ID
	var query = User.findById(id);

	// Execute the query
	query.exec(function (err, user) {
		// Return any errors
		if (err) { return next(err); }
		// If no user is found with given ID, return error
		if (!user) { return next(new Error('can\'t find user')); }

		// If no errors, set req.user = to user from db
		req.user = user;
		return next();
	});
});

/*********************************/
/* GET a single user by _id */
/*********************************/
router.get('/:user', function (req, res, next) {

	// Return the user from the route parameter
	return res.json(req.user);
});


/**************************/
/* DELETE a user */
/**************************/
router.delete('/:user', function (req, res, next) {

	// Remove user using mongoose remove method
	req.user.remove(function (err, user) {
		// Return any errors
		if (err) { return next(err); }

		// If no errors, return a message stating that the user has been removed
		res.json({message: 'User removed'});
	});
});

/************************/
/* UPDATE a user */
/************************/
router.put('/:user', function (req, res, next) {

	User.findById(req.user._id, function (err, user) {

		// Update username if set in form
		if (req.body.username) { user.username = req.body.username; }

		// Update password if set in form
		if (req.body.password) { user.setPassword(req.body.password); }

		// Add role if set in form
		if (req.body.role) { user.roles.push(req.body.role); }

		// Save changes to user using the mongoose save method
		user.save(function (err) {
			// Return any errors
			if (err) { return next(err); }

			/* If no errors, generate a new JWT(jsonwebtoken) for the
			newly added user using the generateJWT method defined in the User Schema */
			return res.json({token: user.generateJWT()});
		});
	});
});

/************************/
/* GET a user's roles */
/*******************************/
router.get('/:user/roles', function (req, res, next) {

	// Return the user from the route parameter
	return res.json(req.user.roles);
});

/*************************/
/* Revoke a role from a user */
/*******************************/
router.put('/:user/roles', function (req, res, next) {

	User.findById(req.user._id, function (err, user) {

		// Add role if set in form
		if (req.body.removeRole == 'yes' && req.body.role) { 
			var index = user.roles.indexOf(req.body.role);
			user.roles.splice(index, 1);
		}

		// Save changes to user using the mongoose save method
		user.save(function (err) {
			// Return any errors
			if (err) { return next(err); }

			/* If no errors, generate a new JWT(jsonwebtoken) for the
			newly added user using the generateJWT method defined in the User Schema */
			return res.json({token: user.generateJWT()});
		});
	});
});

/**************************/
/* End of Routes */
/**************************/

module.exports = router;

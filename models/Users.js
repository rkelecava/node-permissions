var mongoose = require('mongoose');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

/* Create a new mongoose schema for our Users model */
var UserSchema = new mongoose.Schema({
	username: {type: String, lowercase: true, unique: true},
	roles: [String],
	salt: String,
	hash: String
});

/* Add new methods to our schema for setting and validating
a user's password using the built-in 'crypto' library in Nodejs */
UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');

	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

	return this.hash === hash;
};


/* Add a function to generate a new JWT(jsonwebtoken) for an authenticated
user.  The JWT will include the user's username, id, and roles in
the payload.  */
UserSchema.methods.generateJWT = function () {

	// set expiration to 2 days
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 2);

	/* jwt needs to be signed with a secret key.  This is best set in an environment variable,
	but we can fake this in our test environment by setting the environment variable in 
	env.js and calling it if there is no system environment variable found.  Make sure to add env.js
	to the .gitignore file */
	return jwt.sign({
		_id: this._id,
		username: this.username,
		roles: this.roles,
		exp: parseInt(exp.getTime() / 1000),
	}, process.env.JWT_SECRET);
};


/* Create new User model using the UserSchema we just created above */
mongoose.model('User', UserSchema);



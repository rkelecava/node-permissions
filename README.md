This project will attempt to build an ACL authentication system using the MEAN stack with JWT.  By providing middleware that checks for different permission levels ('guest', 'user', 'admin', etc), additional granular control over route access will be achieved.

Update - 6/6/2016:  This project now successfully demonstrates ACL using roles and JWT.

To test this program. Do the following:

Step 1: Using POSTMAN, create a new user (POST: /users, ex. username='admin', password='admin')  Note: A default role of 'guest' will initially be assigned.

Step 2: Try to access either of the 2 test routes (GET: /users/testAdmin, GET: /users/testUser).  Because the user you created in step 1 does not have the 'admin' or 'user' role assigned, access will be denied.

Step 3: Using POSTMAN, update the user you created in step 1 adding the role of 'admin' (PUT: /users/_id, role='admin')

Step 4: Copy JWT from response in Step 3 and add new header in POSTMAN (Key = 'authorization', value='Bearer "JWT from step 3"')

Step 5: You should now be able to access the /users/testAdmin route and it will return your JWT payload.

Routes:

GET - /users, "Returns all users as json data",
POST - /users, "Adds a new user" (username, password, role) returns a JWT
GET - /users/_id, "Returns a single user as JSON"
DELETE - /users/_id, "Delete a single user"
PUT - /users/_id, "Update a user" (username, password, role) returns a JWT
GET - /users/_id/roles, "Returns a list of user's roles as JSON"
PUT - /users/_id/roles, "Removes a role" (removeRole="yes", role)
POST - /users/login, "Login" (username, password)

GET - /users/testAdmin, "Will only work if a valid JWT is provided and user has 'admin' role"
GET - /users/testUser, "Will only work if a valid JWT is provided and user has 'user' role"
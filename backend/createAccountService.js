const bcrypt = require('bcrypt');
var dataAccessAdapter = require('./db');
var database = null;
const clname = "users";

exports.postRequest = function (req, res) {
    body = '';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', async function () {
        postBody = JSON.parse(body);
        if (postBody.publicname && postBody.username && postBody.password) {

            if (!database) {
                database = await dataAccessAdapter.getDb();
            }
            const users = await database.collection(clname).find({}).toArray();
            for (i = 0; i < users.length; ++i) {
                if (users[i].username === postBody.username) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "response": "Username already taken" }));
                    return;
                }
            }
            const hashedPassword = await bcrypt.hash(postBody.password, 10);
            const userToInsert = { publicname: postBody.publicname, username: postBody.username, password: hashedPassword };
            database.collection(clname).insertOne(userToInsert, function (err, r) {
                if (err) {
                    res.statusCode = 400;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "response": "Account could not be created" }));
                } else {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ "response": "Account created succesfully" }));
                }
            });
        } else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ "response": "Invalid data" }));
        }
    });
};
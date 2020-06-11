const bcrypt = require('bcrypt');
var dataAccessAdapter = require('./db');
var database = null;
const clname = "users";
const AUTH_DAYS = 30;

exports.postRequest = function (req, res) {
    body = '';
    req.on('data', function (chunk) {
        body += chunk;
    });
    req.on('end', async function () {
        postBody = JSON.parse(body);
        if (postBody.username && postBody.password) {
            if (!database) {
                database = await dataAccessAdapter.getDb();
            }
            const users = await database.collection(clname).find({}).toArray();
            for (i = 0; i < users.length; ++i) {
                if (users[i].username === postBody.username) {
                    bcrypt.compare(postBody.password, users[i].password, function (err, result) {
                        if (result) {
                            var token = makeid(128);
                            try {
                                database.collection(clname).updateOne(
                                    { "_id": users[i]._id },
                                    {
                                        $set:
                                        {
                                            "token": token,
                                            "expireDate": getValidityDate()
                                        }
                                    }
                                );
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ "response": "Succesfully logged in", "authToken": token }));
                            } catch (e) {
                                res.statusCode = 500;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ "response": "Login failed, please try again later" }));
                            }


                        } else {
                            res.statusCode = 400;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ "response": "Invalid credentials" }));
                            return;
                        }
                    });
                    return;
                }
            }
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ "response": "Invalid credentials" }));
        } else {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ "response": "Invalid data" }));
        }
    });
};

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function getValidityDate() {
    var validity = new Date();
    validity.setDate(validity.getDate() + AUTH_DAYS);
    return validity.toISOString().split('T')[0].replace(/-/g, '');
}
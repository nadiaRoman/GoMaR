const tokenVerifier = require('./tokenVerifier');
const ObjectID = require('mongodb').ObjectID;
const common = require('./common');
var database = null;
const usersCol = "users";

exports.putRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            try {
                putBody = JSON.parse(body);
            } catch (e) {
                common.resInvalid(res);
                return;
            }
            if (checkBody(putBody)) {
                let tags = [];
                try {
                    putBody.tags.forEach(tag => tags.push(ObjectID.createFromHexString(tag)));
                    database.collection(usersCol).updateOne(
                        {
                            "_id": user._id
                        },
                        {
                            $set:
                            {
                                "tags": tags
                            }
                        }
                    );
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "User updated succesfully" }));
                } catch (e) {
                    console.log(e);
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "User could not be updated" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
}

function checkBody(body) {
    return body.tags && Array.isArray(body.tags) && body.tags.every(tag => typeof tag === 'string');
}

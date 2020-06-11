const url = require('url');
const tokenVerifier = require('./tokenVerifier');
const ObjectID = require('mongodb').ObjectID;
const common = require('./common');
var database = null;
const clname = "results";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        const reqUrl = url.parse(req.url, true);
        let results = [];
        if (reqUrl.query.for == 'self') {
            results = await database.collection(clname).find({ userId: user._id }).toArray();
        } else {
            if (reqUrl.query.for == 'all') {
                results = await database.collection(clname).find({}).toArray();
            }
        }

        common.resSet(res, 200);
        res.end(JSON.stringify(results));
    } else {
        common.resUnauthorized(res);
    }
};

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
                postBody = JSON.parse(body);
            } catch (e) {
                common.resInvalid(res);
                return;
            }
            if (checkBody(postBody)) {
                let evaluationId = null;
                try {
                    evaluationId = ObjectID.createFromHexString(postBody.evaluationId);
                } catch (e) {
                    common.resInvalid(res);
                    return;
                }
                try {
                    database.collection(clname).updateOne(
                        {
                            "evaluationId": evaluationId,
                            "userId": user._id
                        },
                        {
                            $set:
                            {
                                "score": postBody.score
                            }
                        },
                        {
                            upsert: true
                        }
                    );
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Result created succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Result could not be created" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
};

function checkBody(postBody) {
    if (postBody.evaluationId &&
        typeof postBody.score === 'number' &&
        postBody.score >= 0 &&
        postBody.score <= 100 &&
        Number.isInteger(postBody.score)) {
        return true;
    }
    return false;
}

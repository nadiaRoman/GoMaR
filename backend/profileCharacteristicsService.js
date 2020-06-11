const tokenVerifier = require('./tokenVerifier');
const ObjectID = require('mongodb').ObjectID;
const common = require('./common');
var database = null;
const clname = "profileCharacteristics";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        const profileCharacteristics = await database.collection(clname).find({}).toArray();

        common.resSet(res, 200);
        res.end(JSON.stringify(profileCharacteristics));
    } else {
        common.resUnauthorized(res);
    }
};

exports.putRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    let putBody = null;
    if (user && user.isAdmin) {
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
            if (checkPutBody(putBody)) {
                let tags = [];
                let selectorType = null;
                try {
                    const characteristicId = ObjectID.createFromHexString(putBody._id);
                    putBody.tags.forEach(tag => tags.push(ObjectID.createFromHexString(tag)));
                    selectorType = ObjectID.createFromHexString(putBody.selectorType);
                    database.collection(clname).updateOne(
                        {
                            "_id": characteristicId
                        },
                        {
                            $set:
                            {
                                "name": putBody.name,
                                "selectorType": selectorType,
                                "tags": tags
                            }
                        }
                    );
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Profile characteristic updated succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Profile characteristic could not be updated" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
};

exports.deleteRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user && user.isAdmin) {
        body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', function () {
            try {
                deleteBody = JSON.parse(body);
            } catch (e) {
                common.resInvalid(res);
                return;
            }
            if (deleteBody._id) {
                try {
                    const characteristicId = ObjectID.createFromHexString(deleteBody._id);
                    database.collection(clname).deleteOne({ "_id": characteristicId });
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Profile characteristic deleted succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Profile characteristic could not be deleted" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
}

exports.postRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user && user.isAdmin) {
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
                let tags = [];
                let selectorType = null;
                try {
                    postBody.tags.forEach(tag => tags.push(ObjectID.createFromHexString(tag)));
                    selectorType = ObjectID.createFromHexString(postBody.selectorType);
                } catch(e) {
                    common.resInvalid(res);
                    return;
                }
                const characteristicToInsert = { name: postBody.name, selectorType: selectorType, tags: tags };
                database.collection(clname).insertOne(characteristicToInsert, function (err, r) {
                    if (err) {
                        common.resSet(res, 400);
                        res.end(JSON.stringify({ "response": "Profile characteristic could not be created" }));
                    } else {
                        common.resSet(res, 200);
                        res.end(JSON.stringify({ "response": "Profile characteristic created succesfully" }));
                    }
                });
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
};

function checkBody(postBody) {
    if (postBody.name && postBody.selectorType && postBody.tags && Array.isArray(postBody.tags)) {
        return postBody.tags.every(tag => typeof tag === 'string');
    }
    return false;
}

function checkPutBody(putBody) {
    return putBody._id && checkBody(putBody);
}
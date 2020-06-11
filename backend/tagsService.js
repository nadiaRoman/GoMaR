const tokenVerifier = require('./tokenVerifier');
const ObjectID = require('mongodb').ObjectID;
const common = require('./common');
var database = null;
const clname = "tags";
const evalCol = "evaluations";
const mannerCol = "goodManners";
const profileCol = "profileCharacteristics";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        const tags = await database.collection(clname).find({}).toArray();

        common.resSet(res, 200);
        res.end(JSON.stringify(tags));
    } else {
        common.resUnauthorized(res);
    }
};

exports.putRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
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
            if (checkBody(putBody)) {
                try {
                    const tagId = ObjectID.createFromHexString(putBody._id);
                    database.collection(clname).updateOne(
                        {
                            "_id": tagId
                        },
                        {
                            $set:
                            {
                                "name": putBody.name
                            }
                        }
                    );
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Tag updated succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Tag could not be updated" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
}

exports.deleteRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user && user.isAdmin) {
        body = '';
        req.on('data', function (chunk) {
            body += chunk;
        });
        req.on('end', async function () {
            try {
                deleteBody = JSON.parse(body);
            } catch (e) {
                common.resInvalid(res);
                return;
            }
            if (deleteBody._id) {
                try {
                    const evaluations = await database.collection(evalCol).find({}).toArray();
                    const manners = await database.collection(mannerCol).find({}).toArray();
                    const profileCharacteristics = await database.collection(profileCol).find({}).toArray();
                    if (checkTagIn(evaluations, deleteBody._id)) {
                        common.deleteFailedResponse('Tag', 'evaluations', res);
                        return;
                    }
                    if (checkTagIn(manners, deleteBody._id)) {
                        common.deleteFailedResponse('Tag', 'goodManners', res);
                        return;
                    }
                    if (checkTagIn(profileCharacteristics, deleteBody._id)) {
                        common.deleteFailedResponse('Tag', 'profileCharacteristics', res);
                        return;
                    }
                    const tagId = ObjectID.createFromHexString(deleteBody._id);
                    database.collection(clname).deleteOne({ "_id": tagId });
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Tag deleted succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Tag could not be deleted" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
}

function checkTagIn(data, tagId) {
    for (let i = 0; i < data.length; ++i) {
        if(data[i].tags && data[i].tags.find(tag => tag.toString() === tagId)){
            return true;
        }
    }
    return false;
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
            if (postBody.name) {
                const tagToInsert = { name: postBody.name };
                database.collection(clname).insertOne(tagToInsert, function (err, r) {
                    if (err) {
                        common.resSet(res, 400);
                        res.end(JSON.stringify({ "response": "Tag could not be created" }));
                    } else {
                        common.resSet(res, 200);
                        res.end(JSON.stringify({ "response": "Tag created succesfully" }));
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

function checkBody(body) {
    if (body.name && body._id) {
        return true;
    }
    return false;
}

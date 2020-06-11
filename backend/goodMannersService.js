const url = require('url');
const tokenVerifier = require('./tokenVerifier');
const ObjectID = require('mongodb').ObjectID;
const common = require('./common');
var database = null;
const clname = "goodManners";
const tagsCol = "tags";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        let goodManners = [];
        const reqUrl = url.parse(req.url, true);
        if (reqUrl.query.selection == 'random') {
            goodManners = await database.collection(clname).aggregate([{ $sample: { size: 1 } }]).toArray();
        } else if (reqUrl.query.selection == 'self') {
            if (user.tags) {
                const manners = await database.collection(clname).find({}).toArray();
                const tags = await database.collection(tagsCol).find({}).toArray();
                manners.forEach(m => {
                    for (let i = 0; i < m.tags.length; ++i) {
                        const userTagMatch = user.tags.find(t => t.toString() === m.tags[i].toString());
                        if (userTagMatch) {
                            goodManners.push(m);
                            break;
                        }
                    }
                });
                goodManners.forEach(m => {
                    const tagsObj = [];
                    m.tags.forEach(tag => {
                        const tagObj = tags.find(t => t._id.toString() === tag.toString());
                        tagsObj.push(tagObj);
                    })
                    m.tags = tagsObj;
                });
            }
        } else {
            goodManners = await database.collection(clname).find({}).toArray();
        }

        common.resSet(res, 200);
        res.end(JSON.stringify(goodManners));
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
                try {
                    const mannerId = ObjectID.createFromHexString(putBody._id);
                    putBody.tags.forEach(tag => tags.push(ObjectID.createFromHexString(tag)));
                    database.collection(clname).updateOne(
                        {
                            "_id": mannerId
                        },
                        {
                            $set:
                            {
                                "manner": putBody.manner,
                                "tags": tags
                            }
                        }
                    );
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Manner updated succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Manner could not be updated" }));
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
                    const mannerId = ObjectID.createFromHexString(deleteBody._id);
                    database.collection(clname).deleteOne({ "_id": mannerId });
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Manner deleted succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Manner could not be deleted" }));
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
                try {
                    postBody.tags.forEach(tag => tags.push(ObjectID.createFromHexString(tag)));
                } catch (e) {
                    common.resInvalid(res);
                    return;
                }
                const mannerToInsert = { manner: postBody.manner, tags: tags };
                database.collection(clname).insertOne(mannerToInsert, function (err, r) {
                    if (err) {
                        common.resSet(res, 400);
                        res.end(JSON.stringify({ "response": "Manner could not be created" }));
                    } else {
                        common.resSet(res, 200);
                        res.end(JSON.stringify({ "response": "Manner created succesfully" }));
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
    return postBody.manner && bodyHasTags(postBody);
}

function checkPutBody(putBody) {
    return putBody._id && putBody.manner && bodyHasTags(putBody);
}

function bodyHasTags(body) {
    return body.tags && Array.isArray(body.tags) && body.tags.every(tag => typeof tag === 'string');
}

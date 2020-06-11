const tokenVerifier = require('./tokenVerifier');
const common = require('./common');
const ObjectID = require('mongodb').ObjectID;
var database = null;
const profileCol = "profileCharacteristics";
const tagsCol = "tags";
const selectorsCol = "selectorTypes";
const usersCol = "users";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        const profileCharacteristics = await database.collection(profileCol).find({}).toArray();
        const tags = await database.collection(tagsCol).find({}).toArray();
        const selectorTypes = await database.collection(selectorsCol).find({}).toArray();

        profileCharacteristics.forEach(p => {
            const selectorTypeObj = selectorTypes.find(s => s._id.toString() === p.selectorType.toString());
            p.selectorType = selectorTypeObj;
            const tagsObj = [];
            p.tags.forEach(tag => {
                const tagObj = tags.find(t => t._id.toString() === tag.toString());
                if (user.tags) {
                    const userHasTag = user.tags.find(t => t.toString() === tagObj._id.toString());
                    if (userHasTag) {
                        tagObj.checked = true;
                    }
                }
                tagsObj.push(tagObj);
            });
            p.tags = tagsObj;
        });
        common.resSet(res, 200);
        res.end(JSON.stringify(profileCharacteristics));
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
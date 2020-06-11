const tokenVerifier = require('./tokenVerifier');
const ObjectID = require('mongodb').ObjectID;
const url = require('url');
const common = require('./common');
var database = null;
const clname = "evaluations";
const tagsCol = "tags";
const selectorsCol = "selectorTypes";
const questionsCol = "questions";
const resultsCol = "results";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        let evaluations = [];
        const reqUrl = url.parse(req.url, true);
        if (reqUrl.query.selection == 'self') {
            if (user.tags) {
                const evals = await database.collection(clname).find({}).toArray();
                const results = await database.collection(resultsCol).find({ userId: user._id }).toArray();
                const tags = await database.collection(tagsCol).find({}).toArray();
                const selectorTypes = await database.collection(selectorsCol).find({}).toArray();
                const questions = await database.collection(questionsCol).find({}).toArray();

                evals.forEach(e => {
                    for (let i = 0; i < e.tags.length; ++i) {
                        const userTagMatch = user.tags.find(t => t.toString() === e.tags[i].toString());
                        if (userTagMatch) {
                            const evaluationResultMatch = results.find(r => r.evaluationId.toString() === e._id.toString());
                            if (evaluationResultMatch) {
                                e.score = evaluationResultMatch.score;
                            } else {
                                e.score = 0;
                            }
                            evaluations.push(e);
                            break;
                        }
                    }
                });
                evaluations.forEach(e => {
                    const tagsObj = [];
                    e.tags.forEach(tag => {
                        const tagObj = tags.find(t => t._id.toString() === tag.toString());
                        tagsObj.push(tagObj);
                    });
                    e.tags = tagsObj;
                });
                evaluations.forEach(e => {
                    const questionsObj = [];
                    e.questions.forEach(question => {
                        const questionObj = { ...questions.find(q => q._id.toString() === question.toString()) };

                        if (questionObj._id) {
                            const selectorTypeObj = selectorTypes.find(s => s._id.toString() === questionObj.selectorType.toString());
                            questionObj.selectorType = selectorTypeObj;
                            questionsObj.push(questionObj);
                        }
                    });
                    e.questions = questionsObj;
                });
            }
        } else {
            evaluations = await database.collection(clname).find({}).toArray();
        }

        common.resSet(res, 200);
        res.end(JSON.stringify(evaluations));
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
                let questions = [];
                try {
                    const evaluationId = ObjectID.createFromHexString(putBody._id);
                    putBody.tags.forEach(tag => tags.push(ObjectID.createFromHexString(tag)));
                    putBody.questions.forEach(question => questions.push(ObjectID.createFromHexString(question)));
                    database.collection(clname).updateOne(
                        {
                            "_id": evaluationId
                        },
                        {
                            $set:
                            {
                                "title": putBody.title,
                                "description": putBody.description,
                                "tags": tags,
                                "dificulty": putBody.dificulty,
                                "questions": questions
                            }
                        }
                    );
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Evaluation updated succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Evaluation could not be updated" }));
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
        req.on('end', async function () {
            try {
                deleteBody = JSON.parse(body);
            } catch (e) {
                common.resInvalid(res);
                return;
            }
            if (deleteBody._id) {
                try {
                    const results = await database.collection(resultsCol).find({}).toArray();
                    if (checkEvaluationIn(results, deleteBody._id)) {
                        common.deleteFailedResponse('Evaluation', 'results', res);
                        return;
                    }

                    const evaluationId = ObjectID.createFromHexString(deleteBody._id);
                    database.collection(clname).deleteOne({ "_id": evaluationId });
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Evaluation deleted succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Evaluation could not be deleted" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
}

function checkEvaluationIn(data, evaluationId) {
    for (let i = 0; i < data.length; ++i) {
        if (data[i].evaluationId.toString() === evaluationId) {
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
            if (checkBody(postBody)) {
                let tags = [];
                let questions = [];
                try {
                    postBody.tags.forEach(tag => tags.push(ObjectID.createFromHexString(tag)));
                    postBody.questions.forEach(question => questions.push(ObjectID.createFromHexString(question)));
                } catch (e) {
                    common.resInvalid(res);
                    return;
                }
                const evaluationToInsert = {
                    title: postBody.title,
                    description: postBody.description,
                    tags: tags,
                    dificulty: postBody.dificulty,
                    questions: questions
                };
                database.collection(clname).insertOne(evaluationToInsert, function (err, r) {
                    if (err) {
                        common.resSet(res, 400);
                        res.end(JSON.stringify({ "response": "Evaluation could not be created" }));
                    } else {
                        common.resSet(res, 200);
                        res.end(JSON.stringify({ "response": "Evaluation created succesfully" }));
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
    if (postBody.title &&
        postBody.description &&
        postBody.tags &&
        postBody.dificulty &&
        postBody.questions &&
        Array.isArray(postBody.tags) &&
        Array.isArray(postBody.questions) &&
        postBody.questions.length) {

        if (typeof postBody.dificulty === 'number' &&
            postBody.dificulty > 0 &&
            postBody.dificulty < 6 &&
            Number.isInteger(postBody.dificulty)) {
            return true;
        }
    }
    return false;
}

function checkPutBody(putBody) {
    return putBody._id && checkBody(putBody);
}
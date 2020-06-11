const tokenVerifier = require('./tokenVerifier');
const ObjectID = require('mongodb').ObjectID;
const common = require('./common');
var database = null;
const clname = "questions";
const evalCol = "evaluations";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        const questions = await database.collection(clname).find({}).toArray();

        common.resSet(res, 200);
        res.end(JSON.stringify(questions));
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
                let selectorType = null;
                try {
                    const questionId = ObjectID.createFromHexString(putBody._id);
                    selectorType = ObjectID.createFromHexString(putBody.selectorType);
                    database.collection(clname).updateOne(
                        {
                            "_id": questionId
                        },
                        {
                            $set:
                            {
                                "question": putBody.question,
                                "selectorType": selectorType,
                                "answers": putBody.answers,
                                "correctAnswers": putBody.correctAnswers
                            }
                        }
                    );
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Question updated succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Question could not be updated" }));
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
                    const evaluations = await database.collection(evalCol).find({}).toArray();
                    if (checkQuestionIn(evaluations, deleteBody._id)) {
                        common.deleteFailedResponse('Question', 'evaluations', res);
                        return;
                    }
                    const questionId = ObjectID.createFromHexString(deleteBody._id);
                    database.collection(clname).deleteOne({ "_id": questionId });
                    common.resSet(res, 200);
                    res.end(JSON.stringify({ "response": "Question deleted succesfully" }));
                } catch (e) {
                    common.resSet(res, 400);
                    res.end(JSON.stringify({ "response": "Question could not be deleted" }));
                }
            } else {
                common.resInvalid(res);
            }
        });
    } else {
        common.resUnauthorized(res);
    }
}

function checkQuestionIn(data, questionId) {
    for (let i = 0; i < data.length; ++i) {
        if (data[i].questions && data[i].questions.find(question => question.toString() === questionId)) {
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
                let selectorType = null;
                try {
                    selectorType = ObjectID.createFromHexString(postBody.selectorType);
                } catch (e) {
                    common.resInvalid(res);
                    return;
                }
                const questionToInsert = {
                    question: postBody.question,
                    selectorType: selectorType,
                    answers: postBody.answers,
                    correctAnswers: postBody.correctAnswers
                };
                database.collection(clname).insertOne(questionToInsert, function (err, r) {
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
    if (postBody.question &&
        postBody.selectorType &&
        postBody.answers &&
        Array.isArray(postBody.answers) &&
        postBody.correctAnswers &&
        Array.isArray(postBody.correctAnswers) &&
        postBody.answers.length &&
        postBody.correctAnswers.length) {

        const answersValid = postBody.answers.every(answer => typeof answer === 'string');
        if (answersValid) {
            return postBody.correctAnswers.every(
                correctAnswer => typeof correctAnswer === 'string' && postBody.answers.indexOf(correctAnswer) > -1);
        }
    }
    return false;
}

function checkPutBody(putBody) {
    return putBody._id && checkBody(putBody);
}

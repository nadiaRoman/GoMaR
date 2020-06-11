var dataAccessAdapter = require('./db');

exports.resUnauthorized = function resUnauthorized(res) {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ "response": "Unauthorized" }));
}

exports.resInvalid = function resInvalid(res) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ "response": "Invalid data" }));
}

exports.resSet = function resSet(res, statusCode) {
    res.statusCode = statusCode;
    res.setHeader('Content-Type', 'application/json');
}

exports.establishDatabaseConnection = async function establishDatabaseConnection(database) {
    if (!database) {
        return await dataAccessAdapter.getDb();
    }
    return database;
}

exports.deleteFailedResponse = function deleteFailedResponse(objName, colName, res) {
    this.resSet(res, 400);
    res.end(JSON.stringify({ "response": `${objName} could not be deleted, it is still used in ${colName}` }));
}
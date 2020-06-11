const tokenVerifier = require('./tokenVerifier');
const common = require('./common');
var database = null;

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        common.resSet(res, 200);
        res.end();
    } else {
        common.resUnauthorized(res);
    }
};
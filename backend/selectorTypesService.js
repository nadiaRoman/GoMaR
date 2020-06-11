const tokenVerifier = require('./tokenVerifier');
const common = require('./common');
var database = null;
const clname = "selectorTypes";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        const selectorTypes = await database.collection(clname).find({}).toArray();

        common.resSet(res, 200);
        res.end(JSON.stringify(selectorTypes));
    } else {
        common.resUnauthorized(res);
    }
};

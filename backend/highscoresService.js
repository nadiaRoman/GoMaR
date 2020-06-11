const tokenVerifier = require('./tokenVerifier');
const common = require('./common');
var database = null;
const usersCol = "users";
const resultsCol = "results";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
    const user = await tokenVerifier.verifyToken(database, req.headers['authorization']);
    if (user) {
        const users = await database.collection(usersCol).find({}).toArray();
        const results = await database.collection(resultsCol).find({}).toArray();
        users.forEach(u => {
            u.highscore = 0;
            results.forEach(result => {
                if (result.userId.toString() === u._id.toString()) {
                    u.highscore += result.score;
                }
            });
        });
        users.sort(function (a, b) { return b.highscore - a.highscore });
        let objToReturn = [];
        users.forEach(u => objToReturn.push({publicname: u.publicname, highscore: u.highscore, isCurrentUser: user.username === u.username}));
        common.resSet(res, 200);
        res.end(JSON.stringify(objToReturn));
    } else {
        common.resUnauthorized(res);
    }
};
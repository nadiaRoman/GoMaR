const common = require('./common');
var database = null;
const usersCol = "users";
const resultsCol = "results";

exports.getRequest = async function (req, res) {
    database = await common.establishDatabaseConnection(database);
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
    let xmlData = `<?xml version="1.0" encoding="UTF-8" ?>
                    <rss version="2.0">
                    <channel>
                    <title>GoMaR</title>
                    <link>http://localhost:3000/rss</link>
                    <description>Web app for offer and learn codes of behaviour and manners matter. Users highscores are shown below.</description>`;

    users.forEach((u, index) => {
        xmlData += `<item>
                        <title>${index + 1} | ${u.publicname}</title>
                        <link>http://localhost:3000/evaluations</link>
                        <description>Score: ${u.highscore}</description>
                    </item>`;
    });
    xmlData += `</channel>
            </rss>`;

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/xml');
    res.end(xmlData);
};
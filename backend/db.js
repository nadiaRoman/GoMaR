const { MongoClient } = require('mongodb');
const dbname = "gomar";
const mongoOptions = { useNewUrlParser: true, useUnifiedTopology: true };
const uri = "mongodb://localhost:27017"

var database = function () { };

module.exports = database;

database.getDb = async function () {
    if (typeof database.db === 'undefined') {
        await database.initDb();
    }
    return database.db;
}

database.initDb = async function () {
    const client = new MongoClient(uri, mongoOptions);
    await client.connect();
    database.db = client.db(dbname);
}

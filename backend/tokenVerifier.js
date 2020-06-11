const usersCol = "users";

exports.verifyToken = async function (database, bearerHeader) {
    if (typeof bearerHeader !== 'undefined') {
        const bearerToken = bearerHeader.split(' ')[1];
        try {
            const user = await database.collection(usersCol).findOne({ token: bearerToken });
            if (user && user.expireDate >= getCurrentDate()) {
                return user;
            }
            return false;
        } catch (e) {
            return false;
        }
    } else {
        return false;
    }
}

function getCurrentDate() {
    var currentDate = new Date();
    return currentDate.toISOString().split('T')[0].replace(/-/g, '');
}
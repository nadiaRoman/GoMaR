const http = require('http');
const url = require('url');
var tagsService = require('./tagsService');
var selectorTypesService = require('./selectorTypesService');
var profileCharacteristicsService = require('./profileCharacteristicsService');
var goodMannersService = require('./goodMannersService');
var questionsService = require('./questionsService');
var evaluationsService = require('./evaluationsService');
var resultsService = require('./resultsService');
var loginService = require('./loginService');
var createAccountService = require('./createAccountService');
var guardService = require('./guardService');
var configureProfileService = require('./configureProfileService');
var highscoresService = require('./highscoresService');
var rssService = require('./rssService');

module.exports = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', '*');
    const reqUrl = url.parse(req.url, true);
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Methods', '*');
        res.statusCode = 200;
        res.end();
        return;
    }
    if (req.method === 'GET') {
        switch (reqUrl.pathname) {
            case '/rss':
                rssService.getRequest(req, res);
                break;
            case '/auth':
                guardService.getRequest(req, res);
                break;
            case '/tags':
                tagsService.getRequest(req, res);
                break;
            case '/goodManners':
                goodMannersService.getRequest(req, res);
                break;
            case '/selectorTypes':
                selectorTypesService.getRequest(req, res);
                break;
            case '/profileCharacteristics':
                profileCharacteristicsService.getRequest(req, res);
                break;
            case '/configureProfile':
                configureProfileService.getRequest(req, res);
                break;
            case '/questions':
                questionsService.getRequest(req, res);
                break;
            case '/evaluations':
                evaluationsService.getRequest(req, res);
                break;
            case '/results':
                resultsService.getRequest(req, res);
                break;
            case '/highscores':
                highscoresService.getRequest(req, res);
                break;
            default:
                invalidRequest(req, res);
        }
    } else if (req.method === 'POST') {
        switch (reqUrl.pathname) {
            case '/createAccount':
                createAccountService.postRequest(req, res);
                break;
            case '/login':
                loginService.postRequest(req, res);
                break;
            case '/tags':
                tagsService.postRequest(req, res);
                break;
            case '/goodManners':
                goodMannersService.postRequest(req, res);
                break;
            case '/profileCharacteristics':
                profileCharacteristicsService.postRequest(req, res);
                break;
            case '/questions':
                questionsService.postRequest(req, res);
                break;
            case '/evaluations':
                evaluationsService.postRequest(req, res);
                break;
            default:
                invalidRequest(req, res);
        }
    } else if (req.method === 'PUT') {
        switch (reqUrl.pathname) {
            case '/tags':
                tagsService.putRequest(req, res);
                break;
            case '/configureProfile':
                configureProfileService.putRequest(req, res);
                break;
            case '/goodManners':
                goodMannersService.putRequest(req, res);
                break;
            case '/questions':
                questionsService.putRequest(req, res);
                break;
            case '/evaluations':
                evaluationsService.putRequest(req, res);
                break;
            case '/profileCharacteristics':
                profileCharacteristicsService.putRequest(req, res);
                break;
            case '/results':
                resultsService.putRequest(req, res);
                break;
            default:
                invalidRequest(req, res);
        }
    } else if (req.method === 'DELETE') {
        switch (reqUrl.pathname) {
            case '/tags':
                tagsService.deleteRequest(req, res);
                break;
            case '/goodManners':
                goodMannersService.deleteRequest(req, res);
                break;
            case '/questions':
                questionsService.deleteRequest(req, res);
                break;
            case '/evaluations':
                evaluationsService.deleteRequest(req, res);
                break;
            case '/profileCharacteristics':
                profileCharacteristicsService.deleteRequest(req, res);
                break;
            default:
                invalidRequest(req, res);
        }
    } else {
        invalidRequest(req, res);
    }
});

function invalidRequest(req, res) {
    res.statusCode = 404;
    res.setHeader('Content-Type', 'text/plain');
    res.end('Invalid Request');
}
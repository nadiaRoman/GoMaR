var http = require('http');
var fs = require('fs');
var path = require('path');

http.createServer(function (req, res) {
   res.writeHead(200, { 'Content-Type': 'text/html' });
   var url = req.url;
   if (url.endsWith('.css')) {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      fs.createReadStream(path.resolve(__dirname, url.substr(1))).pipe(res);
   } else {
      if (url.endsWith('.js')) {
         res.writeHead(200, { 'Content-Type': 'text/javascript' });
         fs.createReadStream(path.resolve(__dirname, url.substr(1))).pipe(res);
      } else {
         if (url.includes('html-blocks')) {
            fs.createReadStream(path.resolve(__dirname, url.substr(1))).pipe(res);
         } else {
            switch (url) {
               case '/':
               case '/home':
                  fs.createReadStream(path.resolve(__dirname, 'html/home.html')).pipe(res);
                  break;
               case '/login':
                  fs.createReadStream(path.resolve(__dirname, 'html/login.html')).pipe(res);
                  break;
               case '/register':
                  fs.createReadStream(path.resolve(__dirname, 'html/register.html')).pipe(res);
                  break;
               case '/configureProfile':
                  fs.createReadStream(path.resolve(__dirname, 'html/configureProfile.html')).pipe(res);
                  break;
               case '/evaluation':
                  fs.createReadStream(path.resolve(__dirname, 'html/evaluation.html')).pipe(res);
                  break;
               case '/highscores':
                  fs.createReadStream(path.resolve(__dirname, 'html/highscores.html')).pipe(res);
                  break;
               case '/recomandations':
                  fs.createReadStream(path.resolve(__dirname, 'html/recomandations.html')).pipe(res);
                  break;
               case '/rss':
                  treatRss(res);
                  break;
               default:
                  fs.createReadStream(path.resolve(__dirname, 'html/404.html')).pipe(res);
            }
         }
      }
   }
}).listen(3000, function () {
   console.log("server start at port 3000");
});

function treatRss(res) {
   res.writeHead(200, { 'Content-Type': 'application/xml' });
   const options = {
      hostname: 'localhost',
      port: 3333,
      path: '/rss',
      method: 'GET'
   }
   const req = http.request(options, r => {
      r.pipe(res);
   })
   req.on('error', error => {
      console.error(error)
   })
   req.end()
}
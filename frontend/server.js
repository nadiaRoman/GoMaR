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
         console.log(url);
         res.writeHead(200, { 'Content-Type': 'text/javascript' });
         fs.createReadStream(path.resolve(__dirname, url.substr(1))).pipe(res);
      } else {
         if (url.includes('html-blocks')) {
            console.log(url);
            fs.createReadStream(path.resolve(__dirname, url.substr(1))).pipe(res);
         }
         else {
            switch (url) {
               case '/':
               case '/login':
                  fs.createReadStream(path.resolve(__dirname, 'html/login.html')).pipe(res);
                  break;
               case '/register':
                  fs.createReadStream(path.resolve(__dirname, 'html/register.html')).pipe(res);
                  break;
               case '/recomandations':
                  fs.createReadStream(path.resolve(__dirname, 'html/recomandations.html')).pipe(res);
                  break;
            }
         }
      }
   }
}).listen(3000, function () {
   console.log("server start at port 3000");
});
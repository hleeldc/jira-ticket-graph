var express = require('express');
var fs = require('fs');
var mkdot = require('./mkdot');

var app = express();

app.use(app.router);
app.use(express.static('./public'));

app.get('/tree/:key', function(req, res) {
	res.setHeader('Content-Type', 'image/svg+xml');
	mkdot.make_graph(req.params.key, function(data) {
		if (data) {
			res.write(data);
		}
		else {
			res.end();
		}
	});
});

app.get('/hello.svg', function(req, res) {
	var data = fs.readFileSync('hello.svg');
	res.setHeader('Content-Type', 'image/svg+xml');
	res.send(data);
});

app.listen(3001);

console.log(app.router);

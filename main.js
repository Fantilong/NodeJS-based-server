var fs = require('fs'),
	path = require('path'),
	http = require('http');

var MIME = {
	'.css': 'text/css',
	'.js': 'application/javascript'
};

function combineFiles(pathnames, callback){
	var output = [];

	(function next(i, len){
		if (i < len) {
			fs.readFile(pathnames[i], function(err, data){
				if (err) {
					callback(err);
				}
				else {
					output.push(data);
					next(i + 1, len);
				}
			});
		}
		else {
			callback(null, Buffer.concat(output));
		}
	})(0, pathnames.length);
};

function main(argv){
	var config = JSON.parse(fs.readFileSync(argv[0]), 'utf-8');
	var root = config.root || '.';
	var port = config.port || 80;

	http.createServer(function(req, res){
		var urlInfo = parseURL(root, req.url);

		combineFiles(urlInfo.pathnames, function(err, data){
			if (err) {
				res.writeHead(404);
				res.end(err.message);
			}
			else {
				res.writeHead(200, {
					'Content-Type': urlInfo.mime
				});
				res.end(data);
			}
		});
	}).listen(port);
};

function parseURL(root, url){
	var base, pathnames, parts;

	// 不存在该字符串，则返回 -1。返回-1，则表示该字符串不存在
	if (url.indexOf('??') === -1) {
		url = url.replace('/', '/??');
	}

	parts = url.split('??');
	base = parts[0];
	pathnames = parts[1].split(',').map(function(value){
		return path.join(root, base, value);
	});

	return {
		mime: MIME[path.extname(pathnames[0])] || 'text/plain',
		pathnames: pathnames
	}
};

main(process.argv.slice(2));

























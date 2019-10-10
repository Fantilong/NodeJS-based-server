// http 接收请求 path 用于做路径拼接 fs 做文件读写
var http = require('http');
var path = require('path');
var fs = require('fs');

// 保存要解析的文件类型,用于设置响应的文件类型
var MIME = {
	'.css': 'text/css',
	'.js': 'application/javascript'
};

/*
@param Array {要合并的文件的路径集}
@param Function {回调函数 异常处理及结果返回}
*/
function combineFiles(pathnames, callback){
	// 读入流 数组
	var output = [];
	// 使用 下标 做控制器，数组长度做终点，回调函数做异常传递，
	// 一旦出现异常就停止了，
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


/*
@param String {根路径}
@param String {path}
@return Object {MIME:类型, pathnames: []}
*/
function parseURL(root, url){
	// 先将路径 String 解析成几个部分
	var base, pathnames, parts;

	// 看画好的下刀的地方，没有就自己画一道
	if (url.indexOf('??') === -1) {
		url.replace('/', '/??');
	}

	// 开刀
	parts = url.split('??');
	// 头
	base = parts[0];
	// 身体
	pathnames = parts[1].split(',').map(function(value){
		return path.join(root, base, value);
	});

	// 返回
	return {
		// 根据 定义好的支持的 文件类型
		mime: MIME[path.extname(pathnames[0])] || 'text/plain',
		pathnames: pathnames 
	}
};

/*
@param String 一个关于 根目录 和 端口 设置 JSON 文件路径
接收并响应 http 请求
*/
function main(argv){
	// 读取 路径中的 .json 文件，拿到 root 和 port 端口
	var config = JSON.parse(fs.readFileSync(argv[0]), 'utf-8');
	var root = config.root || '.';
	var port = config.port || 80;

	// 创建服务器响应请求
	http.createServer(function(req, res){
		// 拿到 请求路径，解析文件路径
		// req.url 只拿path及query后的部分
		var urlInfo = parseURL(root, req.url);

		// 合并文件, 根据执行结果响应
		combineFiles(urlInfo.pathnames, function(err, data){
			if (err) {
				res.writeHead(404);
				res.end(err.message);
			}
			else{
				res.writeHead(200, {
					'Content-Type': urlInfo.mime
				});
				res.end(data);
			}
		});

	}).listen(port);
};

// 启动程序 传入命令行参数
main(process.argv.slice(2));

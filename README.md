# NodeJS_based_server v1.0

#介绍：一个简单的静态文件合并服务器

#1、支持类似以下格式的 JS 或 CSS 文件合并请求
http://assets.example.com/foo/??bar.js,baz.js

#2、支持类似以下格式的普通 JS 或 CSS 文件请求
http://assets.example.com/foo/bar.js

#版本修改：
1、修改串行读取文件较大时，服务器响应等待时间较长的问题
2、v1.0 的实现，响应输出的数据都需要完整的缓存在内存里，
当并发请求数较大时，会有较大的内存开销

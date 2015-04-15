# anyfs-ftp-adapter

[![npm](https://img.shields.io/npm/v/anyfs-ftp-adapter.svg?style=flat-square)](https://www.npmjs.com/package/anyfs-ftp-adapter)
[![npm](https://img.shields.io/npm/dm/anyfs-ftp-adapter.svg?style=flat-square)](https://www.npmjs.com/package/anyfs-ftp-adapter)
[![Travis](https://img.shields.io/travis/anyfs/ftp-adapter.svg?style=flat-square)](https://travis-ci.org/anyfs/ftp-adapter)
![npm](https://img.shields.io/npm/l/anyfs-ftp-adapter.svg?style=flat-square)

FTP adapter for AnyFS

## Usage

```js
var AnyFS = require('anyfs');
var Adapter = require('anyfs-ftp-adapter');
var adapter = new Adapter({
    host: "localhost",
    user: "test",
    pass: "test",
    port: 3334,
});

var fs = new AnyFS(adapter);

fs.list('/dir', function(err, list) {
    console.log(list);
});
```
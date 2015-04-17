'use strict';

var path = require('path');
var Readable = require('stream').Readable;
var JSFtp = require('jsftp');

module.exports = Adapter;

function Adapter(options) {
    this.options = options;
    this.ftp = this._createFTP();
}

Adapter.prototype.features = {};

// convert ftp info to metadata
function parseInfo(info) {
    var metadata = {
        name: info.name,
        time: new Date(info.time),
    };

    // file
    if (info.type == 0) {
        metadata.is_dir = false;
        metadata.size = parseInt(info.size);
    } else {
        metadata.is_dir = true;
    }

    return metadata;
}

function parseError(err) {
    if (!err) return null;

    if (err.code == '550') {
        return error('ENOENT');
    }

    return err;
}

function error(code, message) {
    var err = new Error(message);
    err.code = code;

    return err;
}

// To avoid connection errors, we have to create seperate JSFtp instance for particular operations.
// See https://github.com/sergi/jsftp/issues/66 and https://github.com/sergi/jsftp/issues/103
Adapter.prototype._createFTP = function() {
    return new JSFtp(this.options);
};

Adapter.prototype.metadata = function(p, cb) {
    if (p === '/') {
        return cb(null, {
            is_dir: true,
        });
    }

    var parent = path.dirname(p);
    var basename = path.basename(p);

    this.ftp.ls(parent, function(err, res) {
        if (err) {
            return cb(parseError(err));
        }

        for (var i = res.length - 1; i >= 0; i--) {
            var info = res[i];
            // FIXME: case insensitive?
            if (info.name === basename) {
                var metadata = parseInfo(info);
                return cb(null, metadata);
            }
        }

        cb(error('ENOENT'));
    });

};

Adapter.prototype.list = function(p, cb) {
    // FIXME: dir or file?
    this.ftp.ls(p, function(err, res) {
        if (err) {
            return cb(parseError(err));
        }

        var list = [];
        for (var i = 0, length = res.length; i < length; i++) {
            list.push(parseInfo(res[i]));
        }

        cb(null, list);
    });
};

Adapter.prototype.mkdir = function(p, cb) {
    this.ftp.raw.mkd(p, function(err) {
        cb(parseError(err));
    });
};

Adapter.prototype.delete = function(p, cb) {
    this.ftp.raw.dele(p, function(err) {
        cb(parseError(err));
    });
};

Adapter.prototype.deleteDir = function(p, cb) {
    this.ftp.raw.rmd(p, function(err) {
        cb(parseError(err));
    });
};

Adapter.prototype.move = function(a, b, cb) {
    this.ftp.rename(a, b, function(err, res) {
        cb(parseError(err))
    });
};

Adapter.prototype.createReadStream = function(p, cb) {
    this.ftp.get(p, function(err, socket) {
        if (err) {
            return cb(parseError(err));
        }

        // must call resume?
        socket.resume();
        cb(null, socket);
    });
};

Adapter.prototype.writeFile = function(p, data, cb) {
    this._createFTP().put(data, p, function(err) {
        cb(parseError(err));
    });
};
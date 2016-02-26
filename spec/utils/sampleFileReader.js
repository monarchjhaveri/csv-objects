var fs = require("fs");
var csv = require("csv");
var async = require("async");

module.exports = {
    /**
     *
     * @param filepath
     * @param callback
     * @returns {Array}
     */
    read: function(filepath, finalCallback) {
        async.waterfall([
            function(callback) {
                fs.readFile(__dirname + "/../sampleFiles/" + filepath, null, callback);
            }
        ], finalCallback);
    }
};
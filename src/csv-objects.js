var csv = require('csv');
var async = require("async");

var createRowObject = require("./js/createRowObject.js");

var csvObjects = {
    /**
     *
     * @param {String} string
     * @param {func} callback
     * @returns {Object}
     */
    parse: function parse(string, callback) {
        async.waterfall([
            function(callback) {
                csv.parse(string, callback);
            },
            function(csvArray, callback) {
                var array = arrayWithoutComments(csvArray);
                var headers = array.shift();
                var objectsArray = array.map(function(row) {
                   return createRowObject(headers, {});
                });
                callback(null, objectsArray);
            }
        ], callback);
    }
};

function arrayWithoutComments(csvArray) {
    var array_withNoCommentedOutLines = csvArray.filter(function(row) {
        return (row[0].slice(0,2) !== "#");
    });

    var commentedOutColumnIndexes = [];
    array_withNoCommentedOutLines[0].forEach(function(cell, index) {
        if (cell.slice[0] === "#") {
            commentedOutColumnIndexes.push(index);
        }
    });

    var cleanArray = array_withNoCommentedOutLines.map(function(row) {
        return row.filter(function(cell, index) {
            return commentedOutColumnIndexes.indexOf(index) >= 0;
        });
    });

    return cleanArray;
}

module.exports = csvObjects;
var csvObjects = require("../src/csv-objects");
var async = require("async");
var sampleFileReader = require("./utils/sampleFileReader");
var csv = require("csv");

describe("Simple parsing", function() {
    beforeEach(function(done) {
        var self = this;
        async.waterfall([
            function(callback) {
                sampleFileReader.read("array-parsing-spec.csv", callback);
            },
            function(csvString, callback) {
                csvObjects.parse(csvString, callback);
            },
            function(parsedObject, callback) {
                self.parsedObject = parsedObject;
                callback();
            }
        ], done)
    });

    it("reads a simple file and outputs expected simple object", function(done) {
        expect(this.parsedObject).toEqual(jasmine.objectContaining([
            sample("Alpha", "Beta", "Omega"),
            sample("One", "Two", "Three"),
            sample("Parent", "Child", "Grandchild")
        ]));
        done();
    });
});

function sample(name1, name2, name3) {
    return {
        name: name1,
        children: [
            {
                name: name2,
                children: [
                    {
                        name: name3
                    }
                ]
            }
        ]
    }
}
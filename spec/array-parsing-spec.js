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
            sample("Alpha", 100, "Beta", 200, "Omega", 300),
            sample("One", 1, "Two", 2, "Three", 3),
            sample("Parent", 63, "Child", 43, "Grandchild", 23)
        ]));
        done();
    });
});

function sample(name1, num1, name2, num2, name3, num3) {
    return {
        name: name1,
        number: num1,
        children: [
            {
                name: name2,
                number: num2,
                children: [
                    {
                        name: name3,
                        number: num3
                    }
                ]
            }
        ]
    }
}
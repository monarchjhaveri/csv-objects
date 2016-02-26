var csvObjects = require("../src/csv-objects");
var async = require("async");
var sampleFileReader = require("./utils/sampleFileReader");
var csv = require("csv");

describe("Simple parsing", function() {
    beforeEach(function(done) {
        var self = this;
        async.waterfall([
            function(callback) {
                sampleFileReader.read("simple-parsing-spec.csv", callback);
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
            sample("John","Smith",32),
            sample("Linda","Thatcher",25),
            sample("Jane","Marley",25)
        ]));
        done();
    });
});

function sample(firstName, lastName, age) {
    return {
        firstName: firstName,
        lastName: lastName,
        age: age
    }
}
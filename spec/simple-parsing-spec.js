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
            sample("John","Smith",32,true,false),
            sample("Linda","Thatcher",25,false,true),
            sample("Jane","Marley",25,true,false)
        ]));
        done();
    });
});

function sample(firstName, lastName, age, licensed, registered) {
    return {
        firstName: firstName,
        lastName: lastName,
        age: age,
        licensed: licensed,
        registered: registered
    }
}
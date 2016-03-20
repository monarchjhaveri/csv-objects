var csvObjects = require("../src/csv-objects");
var async = require("async");
var sampleFileReader = require("./utils/sampleFileReader");
var csv = require("csv");

describe("Defined Key Parsing", function() {
    beforeEach(function(done) {
        var self = this;
        async.waterfall([
            function(callback) {
                sampleFileReader.read("primitive-array-parsing-spec.csv", callback);
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

    it("reads a simple file and outputs expected object with defined key", function(done) {
        var sample1 = sample("John",["ax","bx","cx","dx","ex"],[12,23,34,45,56],[true,false,true,false,true,false]);
        var sample2 = sample("JaneDoe",["john","jon"],[12215125,32523],[true]);
        var sample3 = sample("Janette",[],[],[]);
        var sample4 = sample("Dumbo",["true","false","true","false"],[0,0,0,0],[false,false,false,false]);

        expect(this.parsedObject).toEqual(jasmine.objectContaining([sample1, sample2, sample3, sample4]));
        done();
    });
});

function sample(name, stringArray,numberArray,booleanArray) {
    var object ={};
    object[name] = {
        string: stringArray,
        number: numberArray,
        boolean: booleanArray
    };
    return object;
}
var csvObjects = require("../src/csv-objects");
var async = require("async");
var sampleFileReader = require("./utils/sampleFileReader");
var csv = require("csv");

describe("Defined Key Parsing", function() {
    beforeEach(function(done) {
        var self = this;
        async.waterfall([
            function(callback) {
                sampleFileReader.read("defined-key-parsing-spec.csv", callback);
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
        var sample1 = sample("John Smith","Jack Smith","Julie Smith","Male",32,"Sandy Smith",12,"Male");
        var sample2 = sample("James Dean","Jacob Dean","Janette Dean-Smith","Male",18);
        sample2["James Dean"].children = [];
        var sample3 = sample("Julie Dawes","Jaden Dawes","Nicole Dawes","Female",34,"Rachel Higgins",2,"Female");

        expect(this.parsedObject).toEqual(jasmine.objectContaining([sample1, sample2, sample3]));
        done();
    });
});

function sample(x, father, mother, gender, age, childname, childage, childgender) {
    var object ={};
    object[x] = {
        father: father,
        mother: mother,
        gender: gender,
        age: age
    };
    if (childname && childage && childage) {
        object[x].children = [
            {
                name: childname,
                age: childage,
                gender: childgender
            }
        ];
    }
    return object;
}
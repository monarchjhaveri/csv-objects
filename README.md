# Instructions
The first uncommented line will return with
## Data Types

### Strings
By default, everything is a string. For example, the header `person.name` will coerce all values under that column to
string types.

### Numbers
If a header ends in `#`, it will be converted to a number. For example, `person.age#` will be converted to a number.

### Arrays
If a config path ends in `[]`, it will be treated as an array. For example, `person.parents[].age#` says that the
`parents` property is an array, within which exist objects with the property `age`; and `age` is a number.

### Boolean Values
If a header ends in `?`, it will be converted to a number. For example, `person.licensed?` will be converted to a boolean.
Acceptable values are `true/false`, `y/n` and `1/0`.

### Comments
If a cell starts with a single `#`, for example `# hello world` it will be ignored (will be treated as an empty cell)
If the first cell of a row starts with `##`, for example `## hello world`, the entire row will be ignored.
If a header cell is commented out, that column is skipped over on each row.

### Nested properties

Simple nested properties can be defined in the header as follows:

`person.parent.name`, `person.parent.age`

if `person.parent` does not exist, it will be created.

### Primitive properties in Arrays

Sometimes you want to create an array of primitives (strings or integers) using the library.
 For example, you might want to create an object like the following:
 
```
[{
    integers: [1,2,3,4,5],
    strings: ["one","two","three","four","five"],
    boolean: [true,false,true,false,true,false]
}]
```

To do this, use the pipe character `|` as a delimiter and define your headers as follows:

```
integers#[],strings[],boolean?[]
1|2|3|4|5,one|two|three|four|five,true|false|1|0|y|n
```
Keep in mind that mixed data types in the same array are not supported. 

### Defining Keys In CSV

Often, you may wish to define a key string in CSV format. To do so, you would use `{key}`

The following file:
```
{key1},{key1}.month,{key2},{key2}.month
shipment_1,jan,return_1,feb
shipment_2,feb
shipment_3,mar,return2,mar
```

Will translate to the following object:
```
[
    { "shipment_1":"jan","return_1":"feb"},
    { "shipment_2":"feb"},
    { "shipment_3":"mar","return2":"mar"}
]
```


### Creating objects instead of arrays

The best way to create objects instead of arrays is to use the method described in __Defining Keys in CSV__.
After creating such an array, you can run the following code to flatten the array into an object.
You are encouraged to write your own methods for this, since it is impossible to cover all cases for creating objects instead of arrays inside a library.

```
var csvObjects = require('csv-objects');
var csvString = exampleFileAbove;

csvObjects.parse(csvString, function(err, arrayData) {
    let objectData = {};
    arrayData.forEach((obj) => {
        let key = Object.keys(obj)[0]; // get the key
        if (objectData[key]) throw Error("Key [" + key + "] was defined twice!");
        objectData[key] = obj[key]; // set the data value against the key.
    });
});
```
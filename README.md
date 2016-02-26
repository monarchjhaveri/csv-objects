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

### Comments
If a cell starts with a single `#`, for example `# hello world` it will be ignored (will be treated as an empty cell)
If the first cell of a row starts with `##`, for example `## hello world`, the entire row will be ignored.
If a header cell is commented out, that column is skipped over on each row.

## Nested properties

Simple nested properties can be defined in the header as follows:

`person.parent.name`, `person.parent.age`

if `person.parent` does not exist, it will be created.




var BOOLEAN_TRUE_VALUES = ["true","t","y","1"];
var BOOLEAN_FALSE_VALUES = ["false","f","n","0"];

/**
 *
 * @param headersArray
 * @param values
 * @returns {{}}
 */
module.exports = function createRowObject(headersArray, values) {
    var object = {};
    var rowContext = {
        keyDefinitions: []
    };

    headersArray.forEach(function(header, index) {
        var pathArray = header.split(".");
        var value = values[index];
        traversePath(object, pathArray, value, rowContext);
    });

    if(!cleanup(object)) {
        return null;
    } else {
        return object;
    }
};

/**
 *
 * @param object
 * @param pathArray
 * @param value
 * @returns {*}
 */
function traversePath(object, pathArray, value, rowContext) {
    var thisNode = pathArray.shift();

    if (isKeyStringDefinition(thisNode, pathArray)) {
        rowContext.keyDefinitions.forEach(function(keyDef) {
            if (keyDef.key === thisNode) {
                throw Error("Key " + thisNode + " was already defined as " + keyDef.value + ". Check your header definitions.");
            }
        });
        var o = {
            key: thisNode,
            value: value
        };
        rowContext.keyDefinitions.push(o);
        return object;
    }

    var nodeNameToSet = thisNode;
    if (hasDefinedKeyString(thisNode, pathArray)) {
        // replace defined key string with key definition.
        var wasReplaced = false;
        rowContext.keyDefinitions.forEach(function(keyDef) {
            if (thisNode.indexOf(keyDef.key) > -1) {
                nodeNameToSet = thisNode.replace(keyDef.key, keyDef.value);
                wasReplaced = true;
                if (!nodeNameToSet) throw Error("Error parsing defined key header with key [" + keyDef.key +"]; You may have forgotten to define its value in this row.")
            }
        });
        if (!wasReplaced) {
            throw new Error("Could not find key definition for key [" + thisNode + "]; Check your header definitions.");
        }
    }

    if (isArrayNode(nodeNameToSet) && pathArray.length > 0) {
        var arrayNodeNameToSet = nodeNameToSet.slice(0, -2);
        object[arrayNodeNameToSet] = object[arrayNodeNameToSet] || [];

        var nextObject;
        if (!object[arrayNodeNameToSet][0]) {
            nextObject = {};
            object[arrayNodeNameToSet].push(nextObject);
        } else {
            nextObject = object[arrayNodeNameToSet][0]
        }

        traversePath(nextObject, pathArray, value, rowContext);

        return object;
    }
    else if (pathArray.length > 0) {
        object[nodeNameToSet] = object[nodeNameToSet] || {};
        return traversePath(object[nodeNameToSet], pathArray, value, rowContext);
    }
    // set terminal primitive value, either by itself or in array. If isArray, split by "|"
    else if (pathArray.length === 0) {
        var isArray = isArrayNode(nodeNameToSet);

        var valueToSet = undefined;
        var terminalNodeName = isArray ? nodeNameToSet.slice(0,-2) : nodeNameToSet;

        if (isNumberNode(terminalNodeName)) {
            valueToSet = isArray ? massConvert(value, convertToNumber) : convertToNumber(value);
            terminalNodeName = terminalNodeName.slice(0,-1);
        }
        else if (isBooleanNode(terminalNodeName)) {
            valueToSet = isArray ? massConvert(value, convertToBoolean) : convertToBoolean(value);
            terminalNodeName = terminalNodeName.slice(0,-1);
        }
        else { // is string
            // don't modify terminalNodeName
            valueToSet = isArray ? value.split("|").filter(function(s){return s.length > 0;}) : convertToString(value);
        }

        if(terminalNodeName.length === 0) {
            throw Error("Key names must be of length 1 or greater.");
        }

        object[terminalNodeName] = valueToSet;
        return object;
    }
    else {
        throw new Error("Unknown state in path traversal tree. Check if csv-object was configured properly.");
    }
}

function isArrayNode(nodeString) {
    return nodeString.slice(-2) === "[]";
}

function isNumberNode(nodeString) {
    return nodeString.slice(-1) === "#";
}

function convertToNumber(value) {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }

    if (!isNumeric(value)) {
        throw Error("The value [" + value + "] is not numeric, but is under a header that expects it to be numeric.");
    }
    return +value;
}

function convertToString(value) {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }

    return value;
}

function massConvert(value, conversionFunction) {
    return value.split("|").map(function(v) {
        return conversionFunction(v);
    });
}

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isBooleanNode(nodeString) {
    return nodeString.slice(-1) === "?";
}

function convertToBoolean(value) {
    if (value === null || value === undefined || value === "") {
        return undefined;
    }

    if (BOOLEAN_TRUE_VALUES.indexOf(value) >= 0) {
        return true;
    }
    else if (BOOLEAN_FALSE_VALUES.indexOf(value) >= 0) {
        return false;
    }
    else {
        throw Error("Tried to convert [" + value + "] to boolean, but was not acceptable boolean value.");
    }
}

function isKeyStringDefinition(nodeString, pathArray) {
    // returns true if the string is the last node on the path, and is of the format "{...}"
    return pathArray.length === 0 && nodeString[0] === "{" && nodeString[nodeString.length - 1] === "}";
}

function hasDefinedKeyString(nodeString, pathArray) {
    return pathArray.length !== 0 && nodeString[0] === "{" && nodeString[nodeString.length - 1] === "}";
}

function cleanup(rowObject) {
    // if falsey except 0, empty string and boolean, then indicate removal.
    if (!rowObject && rowObject !== "" && rowObject !== 0 && rowObject !== false) {
        return false;
    }

    // deal with arrays here
    if (rowObject instanceof Array) {
        // Traverse each child, and if return is false then splice it out
        // Arrays are always retained, even empty ones.
        var i = rowObject.length;
        while(i--) {
            if(!cleanup(rowObject[i])) {
                rowObject.splice(i, 1);
            }
        }
        return true;
    }

    // deal with objects here
    if (typeof rowObject === "object") {
        // traverse each child, and if return is false then delete it.
        Object.keys(rowObject).forEach(function(key) {
           if(!cleanup(rowObject[key])) {
               delete rowObject[key];
           }
        });

        // if object is now empty, indicate removal
        if (Object.keys(rowObject).length === 0) {
            return false;
        }
    }

    return true;
}
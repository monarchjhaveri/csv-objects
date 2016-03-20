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
    return object;
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

    if (isArrayNode(nodeNameToSet)) {
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
    else if (pathArray.length === 0) {
        var valueToSet = undefined;
        var terminalNodeName = undefined;
        if (isNumberNode(nodeNameToSet)) {
            valueToSet = (isNaN(value) || value === null) ? undefined : +value;
            terminalNodeName = nodeNameToSet.slice(0,-1);
        }
        else { // is string
            valueToSet = value;
            terminalNodeName = nodeNameToSet;
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

function isKeyStringDefinition(nodeString, pathArray) {
    // returns true if the string is the last node on the path, and is of the format "{...}"
    return pathArray.length === 0 && nodeString[0] === "{" && nodeString[nodeString.length - 1] === "}";
}

function hasDefinedKeyString(nodeString, pathArray) {
    return pathArray.length !== 0 && nodeString[0] === "{" && nodeString[nodeString.length - 1] === "}";
}
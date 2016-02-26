/**
 *
 * @param headersArray
 * @param values
 * @returns {{}}
 */
module.exports = function createRowObject(headersArray, values) {
    var object = {};
    headersArray.forEach(function(header, index) {
        var pathArray = header.split(".");
        var value = values[index];
        traversePath(object, pathArray, value);
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
function traversePath(object, pathArray, value) {
    var thisNode = pathArray.shift();

    if (isArrayNode(thisNode)) {
        var newObject = {};
        var nodeNameToSet = thisNode.slice(-2);
        object[thisNode] = object[thisNode] || [];
        object[thisNode].push(newObject);
        return traversePath(newObject, pathArray, value);
    } else if (pathArray.length > 0) {
        var newObject = {};
        object[thisNode] = newObject;
        return traversePath(newObject, pathArray, value);
    } else if (pathArray.length === 0) {
        var isNumber = isNumberNode(thisNode);
        var valueToSet = isNumber ? +value : value;
        var nodeNameToSet = isNumber? thisNode.slice(0,-1) : thisNode;
        object[nodeNameToSet] =  valueToSet;
        return object;
    } else {
        throw new Error("Unknown state in path traversal tree. Check if csv-object was configured properly.");
    }
}

function isArrayNode(nodeString) {
    return nodeString.slice(-2) === "[]";
}

function isNumberNode(nodeString) {
    return nodeString.slice(-1) === "#";
}
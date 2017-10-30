const ordersFields = {
    "start": { "type": "int32", "id": 1 },
    "end": { "type": "int32","id": 2 },
    "totalCount": { "type": "int32", "id": 3 },
    "filteredCount": { "type": "int32", "id": 4 },
	"data": { "rule": "repeated", "type": "BlotterOrder", "id": 5, "options": { "packed": true } },
    "performanceKey": {"type": "int32", "id": 6, "options": { "default": 0 } }
};

const ordersResponseFields = {
    "id": { "type": "int32", "id": 1 },
	"args": { "rule": "repeated", "type": "BlotterOrders", "id": 2, "options": { "packed": true } },
};


function orderMessageSpec (orderColumnsMap){
    const fields = {};    
    let count = 0;

    //Put each column in the mapping
    for (let [name, fldType] of orderColumnsMap) {
        fldType = fldType.toLowerCase();
        
        fields[name] = {};
        fields[name].type = fldType === "decimal" ? "double" : fldType;
        fields[name].id = ++count;
    }

    //Add the key field
    fields.key = { type: "string", id: ++count };

    //Wrap the object as expected by the proto spec
    return { fields: fields };
}

function getOrdersPackage (orderColumnsMap) {
    const orderMessage = orderMessageSpec(orderColumnsMap);
    const ordersMessage = { fields: ordersFields };
    const ordersResponse = { fields: ordersResponseFields };

    const package = {
        "nested": {
            "blotterorderspackage": {
                "nested": {
                    "BlotterOrder": orderMessage,
                    "BlotterOrders": ordersMessage,
                    "BlotterOrdersResponse": ordersResponse
                }
            }
        }
    };

    return package;
}

module.exports = {
    getOrdersPackage
};
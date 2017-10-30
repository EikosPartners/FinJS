import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import sandbox from 'scalejs.sandbox';
import _ from 'lodash';
import $ from 'jquery';
import ko from 'knockout';
import { createViewModel } from 'scalejs.metadataFactory';
import { merge } from 'scalejs';


export default function (node) {

    const columns = [
        // {name: "aaid", field: "id", sortable: true},
        {name: "Account", field: "account", id: "account", sortable: true, width: 87},
        {name: "Trader", field: "trader", id: "trader", sortable: true, width: 75},
        {name: "Strategy", field: "strategy", id: "strategy", sortable: true, width: 89},
        {name: "Counterparty", field: "counterparty", id: "counterparty", sortable: true, width: 125},
        {name: "RIC", field: "ric", id: "ric", sortable: true, width: 60},
        {name: "BBG", field: "bbg", id: "bbg", sortable: true, width: 60},
        {name: "Type", field: "type", id: "type", sortable: true, width: 115},
        {name: "OrderId", field: "orderId", id: "orderId", sortable: true},
        {name: "Quantity", field: "quantity", id: "quantity", sortable: true},
        {name: "Price", field: "price", id: "price", sortable: true, width: 117},
        {name: "Filled", field: "filled", id: "filled", sortable: true},
        {name: "Open", field: "open", id: "open", sortable: true},
        {name: "LimitPrice", field: "limitPrice", id: "limitPrice", sortable: true, width: 117},
        {name: "FilledPrice", field: "filledPrice", id: "filledPrice", sortable: true, width: 117},
        {name: "Venue", field: "venue", id: "venue", sortable: true},
        {name: "Gateway", field: "gateway", id: "gateway", sortable: true, width: 231},
        {name: "Currency", field: "currency", id: "currency", sortable: true, width: 77},
        {name: "Side", field: "side", id: "side", sortable: true, width: 56},
        {name: "OriginalOrderId", field: "originalOrderId", id: "originalOrderId", sortable: true, width: 130},
        {name: "Rejected", field: "rejected", id: "rejected", sortable: true, width: 80},
        {name: "RejectedReason", field: "rejectedReason", id: "rejectedReason", sortable: true, width: 133},
        {name: "State", field: "state", id: "state", sortable: true, width: 116},
        {name: "EntryMethod", field: "entryMethod", id: "entryMethod", sortable: true, width: 241},
        {name: "TransactTime", field: "transactTime", id: "transactTime", sortable: true, width: 231},
        {name: "PlacementTime", field: "placementTime", id: "placementTime", sortable: true, width: 231},
        {name: "EmsTime", field: "emsTime", id: "emsTime", sortable: true, width: 231},
        {name: "Key", field: "key", id: "key", sortable: true, width: 122}
    ];

    const options = {
        enableCellNavigation: true,
        showHeaderRow: true,
        explicitInitialization: true,
        enableColumnReorder: false,
        multiColumnSort: false,
        nonSlickGridOpts: {
            defaultSortDirection: "DESC",
            defaultSortColName: "emsTime"
        }
    };

    return merge(node, {
        data: this.data,
        dictionary: this.dictionary,
        columns: columns,
        options: options,
        recordsStart: ko.observable(0),
        recordsEnd: ko.observable(0),
        totalRowCount: ko.observable(0),
        filteredRowCount: ko.observable(0),
        isScrolling: ko.observable(false)
    });
};


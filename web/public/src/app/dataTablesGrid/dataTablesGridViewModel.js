import { registerBindings, registerTemplates } from 'scalejs.mvvm';
import sandbox from 'scalejs.sandbox';
import _ from 'lodash';
import $ from 'jquery';
import ko from 'knockout';
import {layout} from 'scalejs.navigation';
import { createViewModel } from 'scalejs.metadataFactory';
import { merge } from 'scalejs';

export default function (node) {

    const columns = [
        {title: "algo", field: "algo"},
        {title: "algoParama", field: "algoParams"},
        {title: "avgFillPrice", field: "avgFillPrice"},
        {title: "correlationId", field: "correlationId"},
        {title: "counterparty", field: "counterparty"},
        {title: "currency", field: "currency"},
        {title: "description", field: "description"},
        {title: "emsAccount", field: "emsAccount"},
        {title: "emsId", field: "emsId"},
        {title: "emsblotterTime", field: "emsblotterTime"},
        {title: "event", field: "event"},
        {title: "execFillId", field: "execFillId"},
        {title: "filledQty", field: "filledQty"},
        {title: "gateway", field: "gateway"},
        {title: "guiTxnTime", field: "guiTxnTime"},
        {title: "id", field: "id"},
        {title: "isRejection", field: "isRejection"},
        {title: "jsonType", field: "jsonType"},
        {title: "key", field: "key"},
        {title: "lastFilledQty", field: "lastFilledQty"},
        {title: "limitPrice", field: "limitPrice"},
        {title: "middlewareTime", field: "middlewareTime"},
        {title: "openQty", field: "openQty"},
        {title: "orderBbg", field: "orderBbg"},
        {title: "orderEntryMethod", field: "orderEntryMethod"},
        {title: "orderFilledPrice", field: "orderFilledPrice"},
        {title: "orderId", field: "orderId"},
        {title: "orderRic", field: "orderRic"},
        {title: "orderSide", field: "orderSide"},
        {title: "orderType", field: "orderType"},
        {title: "originalOrderId", field: "originalOrderId"},
        {title: "placementTime", field: "placementTime"},
        {title: "positionId", field: "positionId"},
        {title: "price", field: "price"},
        {title: "qty", field: "qty"},
        {title: "recid", field: "recid"},
        {title: "rejReason", field: "rejReason"},
        {title: "rejectionCode", field: "rejectionCode"},
        {title: "reportType", field: "reportType"},
        {title: "state", field: "state"},
        {title: "stopPrice", field: "stopPrice"},
        {title: "strategy", field: "strategy"},
        {title: "streamer", field: "streamer"},
        {title: "streamerTime", field: "streamerTime"},
        {title: "stopPrice", field: "stopPrice"},
        {title: "tid", field: "tid"},
        {title: "trader", field: "trader"},
        {title: "transactTime", field: "transactTime"},
        {title: "venue", field: "venue"}
    ];

    let count = 0;
    let dataCount = ko.observable(0);

    this.data.subscribe(function () {
        count += 1;
        dataCount(count);
    });

    let options = {};

    return merge(node, {
        data: this.data,
        dictionary: this.dictionary,
        columns: columns,
        options: options,
        dataCount: dataCount
    });
};


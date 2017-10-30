using ProtoBuf;

namespace WpfNodeDemo.Classes
{
    [ProtoContract]
    public class BlotterOrder
    {
        [ProtoMember(1)]
        [ColumnWidth(87)]
        [ColumnName("Account", "account")]
        public string Account { get; set; }

        [ProtoMember(2)]
        [ColumnWidth(75)]
        [ColumnName("Trader", "trader")]
        public string Trader { get; set; }

        [ProtoMember(3)]
        [ColumnWidth(89)]
        [ColumnName("Strategy", "strategy")]
        public string Strategy { get; set; }

        [ProtoMember(4)]
        [ColumnWidth(125)]
        [ColumnName("Counterparty", "counterparty")]
        public string Counterparty { get; set; }

        [ProtoMember(5)]
        [ColumnWidth(50)]
        [ColumnName("RIC", "ric")]
        public string Ric { get; set; }

        [ProtoMember(6)]
        [ColumnWidth(50)]
        [ColumnName("BBG", "bbg")]
        public string Bbg { get; set; }

        [ProtoMember(7)]
        [ColumnWidth(115)]
        [ColumnName("Type", "type")]
        public string Type { get; set; }

        [ProtoMember(8)]
        [ColumnName("OrderId", "orderId")]
        public int OrderId { get; set; }

        [ProtoMember(9)]
        [ColumnName("Quantity", "quantity")]
        public int Quantity { get; set; }

        [ProtoMember(10)]
        [ColumnWidth(117)]
        [ColumnName("Price", "price")]
        public double Price { get; set; }

        [ProtoMember(11)]
        [ColumnName("Filled", "filled")]
        public int Filled { get; set; }

        [ProtoMember(12)]
        [ColumnName("Open", "open")]
        public int Open { get; set; }

        [ProtoMember(13)]
        [ColumnWidth(117)]
        [ColumnName("LimitPrice", "limitPrice")]
        public double LimitPrice { get; set; }

        [ProtoMember(14)]
        [ColumnWidth(117)]
        [ColumnName("FilledPrice", "filledPrice")]
        public double FilledPrice { get; set; }

        [ProtoMember(15)]
        [ColumnName("Venue", "venue")]
        public string Venue { get; set; }

        [ProtoMember(16)]
        [ColumnWidth(231)]
        [ColumnName("Gateway", "gateway")]
        public string Gateway { get; set; }

        [ProtoMember(17)]
        [ColumnName("Currency", "currency")]
        public string Currency { get; set; }

        [ProtoMember(18)]
        [ColumnWidth(56)]
        [ColumnName("Side", "side")]
        public string Side { get; set; }

        [ProtoMember(19)]
        [ColumnName("OriginalOrderId", "originalOrderId")]
        public int OriginalOrderId { get; set; }

        [ProtoMember(20)]
        [ColumnName("Rejected", "rejected")]
        public string Rejected { get; set; }

        [ProtoMember(21)]
        [ColumnName("RejectedReason", "rejectedReason")]
        public string RejectedReason { get; set; }

        [ProtoMember(22)]
        [ColumnWidth(116)]
        [ColumnName("State", "state")]
        public string State { get; set; }

        [ProtoMember(23)]
        [ColumnWidth(241)]
        [ColumnName("EntryMethod", "entryMethod")]
        public string EntryMethod { get; set; }

        [ProtoMember(24)]
        [ColumnWidth(231)]
        [ColumnName("TransactTime", "transactTime")]
        public string TransactTime { get; set; }

        [ProtoMember(25)]
        [ColumnWidth(231)]
        [ColumnName("PlacementTime", "placementTime")]
        public string PlacementTime { get; set; }

        [ProtoMember(26)]
        [ColumnWidth(231)]
        [ColumnName("EmsTime", "emsTime")]
        public string EmsTime { get; set; }

        [ProtoMember(27)]
        [ColumnWidth(122)]
        [ColumnName("Key", "key")]
        public string Key { get; set; }
    }
}

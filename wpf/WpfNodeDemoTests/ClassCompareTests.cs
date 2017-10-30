﻿using System;
using System.Collections.Generic;
using System.Linq;
using KellermanSoftware.CompareNetObjects;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using WpfNodeDemo.Classes;

namespace WpfNodeDemoTests
{
    [TestClass]
    public class ClassCompareTests
    {
        private readonly string json = "{\"id\":1,\"args\":[{\"start\":0,\"end\":10,\"totalCount\":1649,\"filteredCount\":1548,\"data\":[{\"account\":\"Account3\",\"trader\":\"Trader3\",\"strategy\":\"Strategy2\",\"counterparty\":\"Counterparty3\",\"ric\":\"SFF\",\"bbg\":\"XFF\",\"type\":\"MARKET\",\"orderId\":651,\"quantity\":397,\"price\":999.9654251,\"filled\":397,\"open\":0,\"limitPrice\":999.9654251,\"filledPrice\":2.997787205,\"venue\":\"VFF\",\"gateway\":\"INSTINET_GWY\",\"currency\":\"USD\",\"side\":\"BUY\",\"originalOrderId\":537272,\"rejected\":\"FALSE\",\"rejectedReason\":\"\",\"state\":\"FILLED\",\"entryMethod\":\"PROGRAMMATIC_EMS_API\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:38:42.837Z\",\"key\":\"Account2:651\"},{\"account\":\"Account3\",\"trader\":\"Trader3\",\"strategy\":\"Strategy3\",\"counterparty\":\"Counterparty2\",\"ric\":\"SFF\",\"bbg\":\"XFF\",\"type\":\"MARKET\",\"orderId\":2341,\"quantity\":816,\"price\":999.8669568,\"filled\":816,\"open\":0,\"limitPrice\":999.8669568,\"filledPrice\":594.7766004,\"venue\":\"VFF\",\"gateway\":\"BARX_GWY\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":281828,\"rejected\":\"FALSE\",\"rejectedReason\":\"\",\"state\":\"FILLED\",\"entryMethod\":\"INTERACTIVE_CLIENT\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:39:41.919Z\",\"key\":\"Account3:2341\"},{\"account\":\"Account2\",\"trader\":\"Trader2\",\"strategy\":\"Strategy2\",\"counterparty\":\"Counterparty2\",\"ric\":\"SCC\",\"bbg\":\"XCC\",\"type\":\"STOP_LIMIT\",\"orderId\":1084,\"quantity\":827,\"price\":999.7162065,\"filled\":827,\"open\":0,\"limitPrice\":999.7162065,\"filledPrice\":817.6365838,\"venue\":\"VCC\",\"gateway\":\"LMAX_GWY\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":65990,\"rejected\":\"FALSE\",\"rejectedReason\":\"\",\"state\":\"FILLED\",\"entryMethod\":\"INTERACTIVE_CLIENT\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:39:26.144Z\",\"key\":\"Account2:1084\"},{\"account\":\"Account3\",\"trader\":\"Trader3\",\"strategy\":\"Strategy3\",\"counterparty\":\"Counterparty2\",\"ric\":\"SGG\",\"bbg\":\"XGG\",\"type\":\"MARKET\",\"orderId\":838,\"quantity\":614,\"price\":999.6687588,\"filled\":184,\"open\":430,\"limitPrice\":999.6687588,\"filledPrice\":0,\"venue\":\"VGG\",\"gateway\":\"SSFX_GWY\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":360510,\"rejected\":\"TRUE\",\"rejectedReason\":\"rejection test\",\"state\":\"REJECTED\",\"entryMethod\":\"INTERACTIVE_CLIENT\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:38:20.623Z\",\"key\":\"Account3:838\"},{\"account\":\"Account3\",\"trader\":\"Trader3\",\"strategy\":\"Strategy3\",\"counterparty\":\"Counterparty2\",\"ric\":\"SCC\",\"bbg\":\"XCC\",\"type\":\"LIMIT\",\"orderId\":1121,\"quantity\":853,\"price\":999.6001679,\"filled\":853,\"open\":0,\"limitPrice\":999.6001679,\"filledPrice\":844.8692033,\"venue\":\"VCC\",\"gateway\":\"SGFX_GWY\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":949384,\"rejected\":\"FALSE\",\"rejectedReason\":\"\",\"state\":\"CANCELLED\",\"entryMethod\":\"PROGRAMMATIC_EMS_API\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:39:42.472Z\",\"key\":\"Account3:1121\"},{\"account\":\"Account1\",\"trader\":\"Trader1\",\"strategy\":\"Strategy1\",\"counterparty\":\"Counterparty3\",\"ric\":\"SGG\",\"bbg\":\"XGG\",\"type\":\"STOP_LOSS\",\"orderId\":911,\"quantity\":134,\"price\":999.5675473,\"filled\":134,\"open\":0,\"limitPrice\":999.5675473,\"filledPrice\":511.8302254,\"venue\":\"VGG\",\"gateway\":\"SSFX_GWY\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":665856,\"rejected\":\"FALSE\",\"rejectedReason\":\"\",\"state\":\"CANCELLED\",\"entryMethod\":\"INTERACTIVE_CLIENT\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:37:54.692Z\",\"key\":\"Account1:911\"},{\"account\":\"Account1\",\"trader\":\"Trader1\",\"strategy\":\"Strategy1\",\"counterparty\":\"Counterparty3\",\"ric\":\"SAA\",\"bbg\":\"XAA\",\"type\":\"STOP_LIMIT\",\"orderId\":13,\"quantity\":263,\"price\":999.4033533,\"filled\":263,\"open\":0,\"limitPrice\":999.4033533,\"filledPrice\":619.7393409,\"venue\":\"VAA\",\"gateway\":\"MORGAN_STANLEY_GW2\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":401101,\"rejected\":\"TRUE\",\"rejectedReason\":\"rejection test\",\"state\":\"REJECTED\",\"entryMethod\":\"PROGRAMMATIC_EMS_API\",\"transactTime\":\"2016-08-09T17:35:43.492Z\",\"placementTime\":\"2016-08-09T17:35:43.492Z\",\"emsTime\":\"2016-08-09T17:35:47.112Z\",\"key\":\"Account1:13\"},{\"account\":\"Account1\",\"trader\":\"Trader1\",\"strategy\":\"Strategy1\",\"counterparty\":\"Counterparty3\",\"ric\":\"SAA\",\"bbg\":\"XAA\",\"type\":\"STOP_LOSS\",\"orderId\":868,\"quantity\":97,\"price\":999.1681296,\"filled\":0,\"open\":97,\"limitPrice\":0,\"filledPrice\":0,\"venue\":\"VAA\",\"gateway\":\"INSTINET_GWY\",\"currency\":\"USD\",\"side\":\"BUY\",\"originalOrderId\":2391,\"rejected\":\"TRUE\",\"rejectedReason\":\"rejection test\",\"state\":\"REJECTED\",\"entryMethod\":\"PROGRAMMATIC_EMS_API\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:37:29.162Z\",\"key\":\"Account1:868\"},{\"account\":\"Account2\",\"trader\":\"Trader2\",\"strategy\":\"Strategy2\",\"counterparty\":\"Counterparty2\",\"ric\":\"SFF\",\"bbg\":\"XFF\",\"type\":\"STOP_LIMIT\",\"orderId\":2041,\"quantity\":186,\"price\":999.050484,\"filled\":186,\"open\":0,\"limitPrice\":999.050484,\"filledPrice\":0,\"venue\":\"VFF\",\"gateway\":\"MORGAN_STANLEY_GW1\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":360520,\"rejected\":\"FALSE\",\"rejectedReason\":\"\",\"state\":\"FILLED\",\"entryMethod\":\"INTERACTIVE_CLIENT\",\"transactTime\":\"2016-08-09T17:36:54.640Z\",\"placementTime\":\"2016-08-09T17:36:54.640Z\",\"emsTime\":\"2016-08-09T17:39:22.267Z\",\"key\":\"Account2:2041\"},{\"account\":\"Account3\",\"trader\":\"Trader3\",\"strategy\":\"Strategy3\",\"counterparty\":\"Counterparty3\",\"ric\":\"SCC\",\"bbg\":\"XCC\",\"type\":\"STOP_LOSS\",\"orderId\":276,\"quantity\":376,\"price\":998.9801147,\"filled\":0,\"open\":376,\"limitPrice\":0,\"filledPrice\":0,\"venue\":\"VCC\",\"gateway\":\"DBFX_GWY\",\"currency\":\"USD\",\"side\":\"SELL\",\"originalOrderId\":647516,\"rejected\":\"TRUE\",\"rejectedReason\":\"rejection test\",\"state\":\"CANCELLED\",\"entryMethod\":\"INTERACTIVE_CLIENT\",\"transactTime\":\"2016-08-09T17:35:51.879Z\",\"placementTime\":\"2016-08-09T17:35:51.879Z\",\"emsTime\":\"2016-08-09T17:36:19.322Z\",\"key\":\"Account3:276\"}]}]}";
        private IEnumerable<BlotterOrder> orders;

        [TestInitialize]
        public void Initialize()
        {
            var message = JsonConvert.DeserializeObject<ServerMessage<BlotterOrder>>(json);
            orders = message.Args.First().Data;
        }

        [TestMethod]
        public void DeepCompareShowsCorrectCount()
        {
            var comparer = new CompareLogic {Config = {MaxDifferences = int.MaxValue}};
            var result = comparer.Compare(orders.First(), orders.Last());
            Console.WriteLine(result.DifferencesString);
            Assert.AreEqual(23, result.Differences.Count);
        }
    }
}
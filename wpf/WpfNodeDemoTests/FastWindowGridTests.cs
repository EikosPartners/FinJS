using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Remoting.Messaging;
using System.Text;
using System.Threading.Tasks;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using WpfNodeDemo.Classes;

namespace WpfNodeDemoTests
{
    [TestClass]
    public class FastWindowGridTests
    {
        FastWindowGridModel<BlotterOrder> grid = new FastWindowGridModel<BlotterOrder>(10);

        [TestMethod]
        public void NewGridShouldHaveProperCellCounts()
        {

            for (var r = 0; r < grid.RowCount; r++)
                for (var c = 0; c < grid.ColumnCount; c++)
                    Assert.IsNotNull(grid.GetCellText(r, c), $"grid.GetCellText({r},{c}) should not be null");
        }

        [TestMethod]
        public void GridShouldThrowOutOfRangeExceptions()
        {
            //should throw an out of range exceptions
            Assert.IsTrue(ReturnException(() => grid.GetCellText(grid.RowCount + 1, 0)) is ArgumentOutOfRangeException);
            Assert.IsTrue(ReturnException(() => grid.GetCellText(grid.RowCount + 1, grid.ColumnCount)) is ArgumentOutOfRangeException);
            Assert.IsTrue(ReturnException(() => grid.GetCellText(grid.RowCount + 1, grid.ColumnCount + 1)) is ArgumentOutOfRangeException);

            Assert.IsTrue(ReturnException(() => grid.GetCellText(0, grid.ColumnCount)) is ArgumentOutOfRangeException);
            Assert.IsTrue(ReturnException(() => grid.GetCellText(grid.RowCount, grid.ColumnCount)) is ArgumentOutOfRangeException);
            Assert.IsTrue(ReturnException(() => grid.GetCellText(grid.RowCount + 1, grid.ColumnCount + 1)) is ArgumentOutOfRangeException);

        }

        [TestMethod]
        public void ColumnNamesShouldMatchObject()
        {
            var order = new BlotterOrder();
            var expectednames = order
                .GetType()
                .GetProperties()
                .Select(prop => (((ColumnNameAttribute)prop.GetCustomAttributes(typeof(ColumnNameAttribute), false).First()).DisplayName))
                .ToList();

            //Should be in order
            for (var i = 0; i < expectednames.Count; i++)
                Assert.AreEqual(expectednames[i], grid.GetColumnHeaderText(i), $"At position {i}, expected {expectednames[i]} but grid returned {grid.GetColumnHeaderText(i)}");

            //Should throw exception when out of range
            Assert.IsTrue(ReturnException(() => grid.GetColumnHeaderText(-1)) is ArgumentOutOfRangeException);
            Assert.IsTrue(ReturnException(() => grid.GetColumnHeaderText(expectednames.Count + 1)) is ArgumentOutOfRangeException);
        }


        /// <summary>
        /// Returns the thrown <code>Exception</code> from the passed <see cref="Action"/>
        /// </summary>
        /// <param name="throwExAction"><see cref="Action"/> that should show an <code>Exception</code></param>
        /// <returns><code>Exception</code> or <code>null</code> if none.</returns>
        private static Exception ReturnException(Action throwExAction)
        {
            Exception ex = null;

            try
            {
                throwExAction();
            }
            catch (Exception e)
            {
                ex = e;
            }

            return ex;

        }
    }
}

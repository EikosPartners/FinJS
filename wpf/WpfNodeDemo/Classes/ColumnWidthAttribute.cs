using System;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Specifies the default width of the column when first displayed.
    /// </summary>
    public class ColumnWidthAttribute: Attribute
    {
        /// <summary>
        /// Width in pixels.
        /// </summary>
        public int Width { get; set; }

        /// <summary>
        /// Initializes a new instance of the class using the passed width.
        /// </summary>
        /// <param name="width">Width in pixels.</param>
        public ColumnWidthAttribute(int width)
        {
            Width = width;
        }
    }
}

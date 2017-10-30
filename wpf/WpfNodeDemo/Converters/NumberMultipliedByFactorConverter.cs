using System;
using System.Globalization;
using System.Windows.Data;

namespace WpfNodeDemo.Converters
{
    /// <summary>
    /// Return the passed value multiplied by the passed <see cref="Factor"/>.
    /// </summary>
    public class NumberMultipliedByFactorConverter : IValueConverter
    {
        /// <summary>
        /// Factor to multiply against the passed value.
        /// </summary>
        public double Factor { get; set; }


        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            return ((double)value) * Factor;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            return ((double)value) / Factor;
        }
    }
}

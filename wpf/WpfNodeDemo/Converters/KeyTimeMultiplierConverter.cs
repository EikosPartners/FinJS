using System;
using System.Diagnostics;
using System.Globalization;
using System.Windows.Data;
using System.Windows.Media.Animation;

namespace WpfNodeDemo.Converters
{
    /// <summary>
    /// Return the referenced <see cref="KeyTime"/> as <c>Ticks</c> multiplied by passed
    /// <see cref="double"/> value.
    /// </summary>
    public class KeyTimeMultiplierConverter : IValueConverter
    {
        /// <summary>
        /// <see cref="KeyTime"/> to multiply against the passed value.
        /// </summary>
        public KeyTime KeyTime { get;set; }

        public object Convert(object value, Type targetType, object parameter, CultureInfo culture)
        {
            if (value == null)
                return null;

            var multipler = Math.Abs((double) value);

            var ticks = KeyTime.TimeSpan.Ticks / multipler;
            var newspan = new TimeSpan((long)(ticks));

            Trace.WriteLine((KeyTime)newspan);

            return (KeyTime)newspan;
        }

        public object ConvertBack(object value, Type targetType, object parameter, CultureInfo culture)
        {
            throw new NotImplementedException();
        }
    }
}

using Newtonsoft.Json.Converters;

namespace WpfNodeDemo.Converters
{
    /// <summary>
    /// Extends <see cref="StringEnumConverter"/> to perform enum name
    /// conversion using Camel Case.
    /// </summary>
    public class CamelCaseStringEnumConverter : StringEnumConverter
    {
        public CamelCaseStringEnumConverter()
        {
            CamelCaseText = true;
        }
    }
}
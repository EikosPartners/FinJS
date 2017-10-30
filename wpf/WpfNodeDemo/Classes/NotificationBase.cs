using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using System.Runtime.CompilerServices;

namespace WpfNodeDemo.Classes
{
    /// <summary>
    /// Abstract class that adds strong-typed property notification methods, inherits INotifyPropertyChanged
    /// </summary>
    public abstract class NotificationsBase : INotifyPropertyChanged
    {
        /// <summary>
        /// Get the properties of the class via reflections
        /// </summary>
        /// <returns>List&lt;PropertyInfo&gt;</returns>
        protected List<PropertyInfo> GetPublicWritableProperties()
        {
            Type type = this.GetType();
            BindingFlags flags = BindingFlags.Public | BindingFlags.Instance;

            return type.GetProperties(flags).Where(t => t.CanWrite).ToList();
        }

        /// <summary>
        /// Both set the property and raise notify that the property has changed
        /// </summary>
        /// <typeparam name="T">The property type (implicit)</typeparam>
        /// <param name="field">The Property (by reference)</param>
        /// <param name="value">The new value</param>
        /// <param name="propertyName">Optional property name; generally it should not be set and will be determined at runtime.</param>
        /// <example>
        ///     private string _name;
        ///     public string Name
        ///     {
        ///         get { return _name; }
        ///         set { this.NotifySetProperty(ref _name, value); }
        ///     }
        /// </example>
        protected void NotifySetProperty<T>(ref T field, T value, [CallerMemberName] string propertyName = null)
        {
            //Proceed if the field is null and the value is not null OR the field is not null and the field does not equal the value
            if (field == null ? value != null : !field.Equals(value))
            {
                field = value;
                NotifyProperty(propertyName);
            }
        }

        /// <summary>
        /// Raise the notification that the property has changed
        /// </summary>
        /// <param name="propertyName">Optional property name; generally it should not be set and will be determined at runtime.</param>
        protected void NotifyProperty(string propertyName)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }

        /// <summary>
        /// Event for when the property changed triggered by the property Notifications
        /// </summary>
        public event PropertyChangedEventHandler PropertyChanged;
    }
}

using System;
using System.Windows.Input;

namespace WpfNodeDemo.Classes
{

    /// <summary>
    /// Allows delegating the commanding logic to methods passed as parameters and 
    /// enables a View to bind commands to objects that are not part of the element tree.
    /// </summary>
    public class DelegateCommand : ICommand
    {
        private readonly Action command;
        private readonly Func<bool> canExecute;
        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public DelegateCommand(Action command, Func<bool> canExecute = null)
        {
            if (command == null)
                throw new ArgumentNullException();
            this.canExecute = canExecute;
            this.command = command;
        }

        public void Execute(object parameter)
        {
            command();
        }

        public bool CanExecute(object parameter)
        {
            return canExecute == null || canExecute();
        }

    }

    /// <summary>
    /// Allows delegating the commanding logic to methods passed as parameters and 
    /// enables a View to bind commands to objects that are not part of the element tree.
    /// </summary>
    /// <typeparam name="T">Type of the parameter passed to the delegates</typeparam>
    public class DelegateCommand<T> : ICommand
    {
        private readonly Action<T> command;
        private readonly Func<bool> canExecute;
        public event EventHandler CanExecuteChanged
        {
            add { CommandManager.RequerySuggested += value; }
            remove { CommandManager.RequerySuggested -= value; }
        }

        public DelegateCommand(Action<T> command, Func<bool> canExecute = null)
        {
            if (command == null)
                throw new ArgumentNullException();
            this.canExecute = canExecute;
            this.command = command;
        }

        public void Execute(T parameter)
        {
            command(parameter);
        }

        public bool CanExecute(T parameter)
        {
            return canExecute == null || canExecute();
        }

        #region ICommand Members

        bool ICommand.CanExecute(object parameter)
        {
            if (parameter == null && typeof(T).IsValueType)
                //T is of value type and the parameter is not set yet so return false if CanExecute delegate exists else return true
                return (canExecute == null);

            return CanExecute((T)parameter);
        }

        void ICommand.Execute(object parameter)
        {
            Execute((T)parameter);
        }

        #endregion

    }
}

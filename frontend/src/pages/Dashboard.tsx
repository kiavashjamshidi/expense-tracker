import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import BarChart from '../components/BarChart';

interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: {
    id: number;
    name: string;
  };
}

interface Salary {
  id: number;
  amount: number;
  date: string;
  description: string;
}

interface Category {
  id: number;
  name: string;
  description: string;
}

const Dashboard: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [salaryAmount, setSalaryAmount] = useState('');
  const [salaryDescription, setSalaryDescription] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [editingExpense, setEditingExpense] = useState<number | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);
  const { user, authenticatedFetch } = useAuth();

  useEffect(() => {
    fetchExpenses();
    fetchCategories();
    fetchSalaries();
  }, []);

  const fetchExpenses = async () => {
    try {
      const response = await authenticatedFetch('/api/expenses/');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      setExpenses([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/expenses/categories/');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      setCategories([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await authenticatedFetch('/api/expenses/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description || 'Expense',
          amount: parseFloat(amount),
          category_id: parseInt(categoryId),
        }),
      });

      if (response.ok) {
        setDescription('');
        setAmount('');
        setCategoryId('');
        setShowForm(false);
        fetchExpenses();
      }
    } catch (error) {
      console.error('Failed to create expense:', error);
    }
  };

  const handleSalarySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await authenticatedFetch('/api/salaries/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: salaryDescription || 'Salary',
          amount: parseFloat(salaryAmount),
        }),
      });

      if (response.ok) {
        setSalaryAmount('');
        setSalaryDescription('');
        setShowSalaryForm(false);
        fetchSalaries();
      }
    } catch (error) {
      console.error('Failed to create salary entry:', error);
    }
  };

  const fetchSalaries = async () => {
    try {
      const response = await authenticatedFetch('/api/salaries/');
      if (response.ok) {
        const data = await response.json();
        setSalaries(data);
      }
    } catch (error) {
      setSalaries([]);
    }
  };

  const deleteExpense = async (id: number) => {
    try {
      const response = await authenticatedFetch(`/api/expenses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchExpenses();
        setDeleteConfirm(null);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense.id);
    setDescription(expense.description || '');
    setAmount(expense.amount.toString());
    setCategoryId(expense.category.id.toString());
  };

  const cancelEdit = () => {
    setEditingExpense(null);
    setDescription('');
    setAmount('');
    setCategoryId('');
  };

  const updateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingExpense) return;

    try {
      const response = await authenticatedFetch(`/api/expenses/${editingExpense}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: description || 'Expense',
          amount: parseFloat(amount),
          category_id: parseInt(categoryId),
        }),
      });

      if (response.ok) {
        setEditingExpense(null);
        setDescription('');
        setAmount('');
        setCategoryId('');
        fetchExpenses();
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  
  // Calculate total salaries for current month
  const currentMonthSalaries = salaries.filter(salary => {
    const salaryDate = new Date(salary.date);
    return salaryDate.getMonth() === currentMonth && salaryDate.getFullYear() === currentYear;
  });
  const totalSalaries = currentMonthSalaries.reduce((sum, salary) => sum + salary.amount, 0);

  // Filter expenses for current month
  const currentMonthExpenses = expenses.filter(expense => {
    const expenseDate = new Date(expense.date);
    return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
  });

  // Calculate category totals for pie chart
  const categoryTotals = currentMonthExpenses.reduce((acc, expense) => {
    const categoryName = expense.category?.name || 'Other';
    acc[categoryName] = (acc[categoryName] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // Colors for pie chart
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

  // Simple pie chart component
  const PieChart = () => {
    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0);
    if (total === 0) return <div className="text-gray-500 text-center py-8">No expenses this month</div>;

    let cumulativePercentage = 0;
    
    return (
      <div className="flex flex-col items-center">
        <svg width="200" height="200" className="mb-4">
          {Object.entries(categoryTotals).map(([category, amount], index) => {
            const percentage = (amount / total) * 100;
            const startAngle = (cumulativePercentage / 100) * 360;
            const endAngle = ((cumulativePercentage + percentage) / 100) * 360;
            
            const x1 = 100 + 80 * Math.cos((startAngle - 90) * Math.PI / 180);
            const y1 = 100 + 80 * Math.sin((startAngle - 90) * Math.PI / 180);
            const x2 = 100 + 80 * Math.cos((endAngle - 90) * Math.PI / 180);
            const y2 = 100 + 80 * Math.sin((endAngle - 90) * Math.PI / 180);
            
            const largeArcFlag = percentage > 50 ? 1 : 0;
            
            const pathData = [
              `M 100 100`,
              `L ${x1} ${y1}`,
              `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              'Z'
            ].join(' ');

            cumulativePercentage += percentage;

            return (
              <path
                key={category}
                d={pathData}
                fill={colors[index % colors.length]}
                stroke="white"
                strokeWidth="2"
              />
            );
          })}
        </svg>
        <div className="space-y-2">
          {Object.entries(categoryTotals).map(([category, amount], index) => (
            <div key={category} className="flex items-center space-x-2">
              <div 
                className="w-4 h-4 rounded" 
                style={{ backgroundColor: colors[index % colors.length] }}
              ></div>
              <span className="text-sm">{category}: ${amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: number) => {
    let newMonth = currentMonth + direction;
    let newYear = currentYear;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    } else if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => setShowSalaryForm(!showSalaryForm)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showSalaryForm ? 'Cancel' : 'Add Salary'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {showForm ? 'Cancel' : 'Add Expense'}
          </button>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex justify-center items-center mb-8 bg-white p-4 rounded-lg shadow-md">
        <button
          onClick={() => navigateMonth(-1)}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-l"
        >
          ←
        </button>
        <div className="px-6 py-1 bg-blue-600 text-white font-semibold">
          {monthNames[currentMonth]} {currentYear}
        </div>
        <button
          onClick={() => navigateMonth(1)}
          className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-r"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Monthly Expenses</h3>
              <p className="text-lg font-bold text-red-600">
                ${currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Monthly Income</h3>
              <p className="text-lg font-bold text-green-600">
                ${totalSalaries.toFixed(2)}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Net Balance</h3>
              <p className={`text-lg font-bold ${totalSalaries - currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalSalaries - currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0)).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Monthly Transactions</h3>
              <p className="text-2xl font-bold text-purple-600">{currentMonthExpenses.length}</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold text-gray-700">Categories Used</h3>
              <p className="text-2xl font-bold text-orange-600">{Object.keys(categoryTotals).length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Expenses by Category (Pie)</h3>
          <PieChart />
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Expenses by Category (Bar)</h3>
          <BarChart data={categoryTotals} />
        </div>
      </div>

      {(showForm || editingExpense) && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">
            {editingExpense ? 'Edit Expense' : 'Add New Expense'}
          </h2>
          <form onSubmit={editingExpense ? updateExpense : handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="e.g., Lunch at restaurant"
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
              {editingExpense && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {showSalaryForm && (
        <div className="bg-white p-6 rounded-lg shadow-md mb-8">
          <h2 className="text-xl font-bold mb-4">Add Salary/Income</h2>
          <form onSubmit={handleSalarySubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <input
                type="number"
                step="0.01"
                value={salaryAmount}
                onChange={(e) => setSalaryAmount(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={salaryDescription}
                onChange={(e) => setSalaryDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500"
                placeholder="e.g., Monthly salary, Freelance work"
              />
            </div>
            <div className="md:col-span-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Add Income
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">
            {monthNames[currentMonth]} {currentYear} Expenses
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {currentMonthExpenses.map((expense) => (
                <tr key={expense.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {expense.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.category?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${expense.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(expense.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => startEdit(expense)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(expense.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {currentMonthExpenses.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No expenses found for {monthNames[currentMonth]} {currentYear}. Add your first expense to get started!
            </div>
          )}
        </div>
      </div>

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this expense? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteExpense(deleteConfirm)}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
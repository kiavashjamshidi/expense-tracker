import React from 'react';

interface BarChartProps {
  data: { [key: string]: number };
}

const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const sortedEntries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const maxValue = Math.max(...Object.values(data));
  
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];

  if (sortedEntries.length === 0) {
    return <div className="text-gray-500 text-center py-8">No data available</div>;
  }

  return (
    <div className="space-y-3">
      {sortedEntries.map(([category, amount], index) => (
        <div key={category} className="flex items-center">
          <div className="w-24 text-sm font-medium text-gray-700 truncate">
            {category}
          </div>
          <div className="flex-1 mx-3">
            <div className="bg-gray-200 rounded-full h-6 relative">
              <div
                className="h-6 rounded-full"
                style={{
                  width: `${(amount / scaleReference) * 100}%`,
                  backgroundColor: colors[index % colors.length],
                  minWidth: '8px'
                }}
              />
            </div>
          </div>
          <div className="w-20 text-right text-sm font-semibold text-gray-900">
            ${amount.toFixed(2)}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BarChart;
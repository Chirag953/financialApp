'use client';

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

interface ChartsProps {
  topDepartments: any[];
  budgetByCategory: any[];
}

export function DashboardCharts({ topDepartments, budgetByCategory }: ChartsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(value);
  };

  return (
    <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
      <Card className="lg:col-span-4 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Top Departments by Budget</CardTitle>
        </CardHeader>
        <CardContent className="pl-2">
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={topDepartments} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
                barGap={2}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                <XAxis type="number" tickFormatter={formatCurrency} hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  width={150} 
                  tick={(props) => {
                    const { x, y, payload } = props;
                    const value = payload.value;
                    const maxLength = 20;
                    const displayName = value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
                    
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <title>{value}</title>
                        <text 
                          x={-10} 
                          y={0} 
                          dy={4} 
                          textAnchor="end" 
                          fill="currentColor" 
                          className="text-[10px] font-bold text-slate-500 dark:text-slate-400"
                        >
                          {displayName}
                        </text>
                      </g>
                    );
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 12px'
                  }}
                />
                <Bar dataKey="budget" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                <Bar dataKey="spent" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center mt-6 space-x-8 text-xs font-bold text-slate-500 uppercase tracking-wider">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-sm mr-2 shadow-sm" />
              Budget
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-2 shadow-sm" />
              Spent
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-3 border-slate-200 dark:border-slate-800 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">Budget by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {budgetByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any) => [formatCurrency(Number(value || 0)), '']}
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    padding: '8px 12px'
                  }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  wrapperStyle={{ 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    paddingTop: '20px'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { useState } from 'react';
import { Calendar, Eye } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';

const stats = [
  { title: 'Total Orders', value: '2,847', change: 12.5, isPositive: true },
  { title: 'New Orders', value: '143', change: 8.2, isPositive: true },
  { title: 'Shipped', value: '1,892', change: 5.3, isPositive: true },
  { title: 'Cancelled', value: '67', change: -3.1, isPositive: false },
  { title: 'Returns', value: '124', change: -1.8, isPositive: false },
  { title: 'Net Revenue', value: '$48,392', change: 15.7, isPositive: true },
];

const recentOrders = [
  {
    id: '#ORD-2847',
    customer: 'Emma Wilson',
    phone: '+1 234-567-8901',
    status: 'Shipped',
    time: '2 hours ago',
  },
  {
    id: '#ORD-2846',
    customer: 'Michael Chen',
    phone: '+1 234-567-8902',
    status: 'Processing',
    time: '3 hours ago',
  },
  {
    id: '#ORD-2845',
    customer: 'Sofia Rodriguez',
    phone: '+1 234-567-8903',
    status: 'New',
    time: '5 hours ago',
  },
  {
    id: '#ORD-2844',
    customer: 'James Taylor',
    phone: '+1 234-567-8904',
    status: 'Delivered',
    time: '1 day ago',
  },
  {
    id: '#ORD-2843',
    customer: 'Olivia Brown',
    phone: '+1 234-567-8905',
    status: 'Shipped',
    time: '1 day ago',
  },
  {
    id: '#ORD-2842',
    customer: 'Liam Johnson',
    phone: '+1 234-567-8906',
    status: 'Processing',
    time: '1 day ago',
  },
  {
    id: '#ORD-2841',
    customer: 'Ava Martinez',
    phone: '+1 234-567-8907',
    status: 'Cancelled',
    time: '2 days ago',
  },
  {
    id: '#ORD-2840',
    customer: 'Noah Davis',
    phone: '+1 234-567-8908',
    status: 'Delivered',
    time: '2 days ago',
  },
];

const statusColors: Record<string, string> = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export function Dashboard() {
  const [dateFilter, setDateFilter] = useState('last7');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const totalPages = Math.ceil(recentOrders.length / itemsPerPage);

  const paginatedOrders = recentOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Monitor your store performance</p>
        </div>

        {/* Date Filter */}
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <Calendar className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="last7">Last 7 days</SelectItem>
            <SelectItem value="last30">Last 30 days</SelectItem>
            <SelectItem value="custom">Custom range</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
          <p className="text-sm text-muted-foreground mt-1">Latest orders from your customers</p>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Order ID</TableHead>
                <TableHead>Customer Name</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created Time</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.map((order) => (
                <TableRow key={order.id} className="hover:bg-muted">
                  <TableCell className="font-medium text-foreground">{order.id}</TableCell>
                  <TableCell>{order.customer}</TableCell>
                  <TableCell className="text-muted-foreground">{order.phone}</TableCell>
                  <TableCell>
                    <Select defaultValue={order.status}>
                      <SelectTrigger className="w-32 h-8 border-0 focus:ring-0">
                        <Badge
                          variant="outline"
                          className={statusColors[order.status]}
                        >
                          {order.status}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusColors).map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{order.time}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50">
                      <Eye className="w-4 h-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="p-6 border-t border-border flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, recentOrders.length)} of {recentOrders.length}{' '}
            orders
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

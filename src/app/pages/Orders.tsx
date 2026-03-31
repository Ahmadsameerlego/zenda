import { useState } from 'react';
import { Search, Plus, FileUp, Calendar, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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

const allOrders = [
  {
    id: '#ORD-2847',
    customer: 'Emma Wilson',
    phone: '+1 234-567-8901',
    status: 'Shipped',
    amount: '$249.00',
    items: 3,
    time: '2 hours ago',
  },
  {
    id: '#ORD-2846',
    customer: 'Michael Chen',
    phone: '+1 234-567-8902',
    status: 'Processing',
    amount: '$189.50',
    items: 2,
    time: '3 hours ago',
  },
  {
    id: '#ORD-2845',
    customer: 'Sofia Rodriguez',
    phone: '+1 234-567-8903',
    status: 'New',
    amount: '$420.00',
    items: 5,
    time: '5 hours ago',
  },
  {
    id: '#ORD-2844',
    customer: 'James Taylor',
    phone: '+1 234-567-8904',
    status: 'Delivered',
    amount: '$315.00',
    items: 4,
    time: '1 day ago',
  },
  {
    id: '#ORD-2843',
    customer: 'Olivia Brown',
    phone: '+1 234-567-8905',
    status: 'Shipped',
    amount: '$128.00',
    items: 1,
    time: '1 day ago',
  },
  {
    id: '#ORD-2842',
    customer: 'Liam Johnson',
    phone: '+1 234-567-8906',
    status: 'Processing',
    amount: '$567.00',
    items: 6,
    time: '1 day ago',
  },
  {
    id: '#ORD-2841',
    customer: 'Ava Martinez',
    phone: '+1 234-567-8907',
    status: 'Cancelled',
    amount: '$89.00',
    items: 1,
    time: '2 days ago',
  },
  {
    id: '#ORD-2840',
    customer: 'Noah Davis',
    phone: '+1 234-567-8908',
    status: 'Delivered',
    amount: '$445.00',
    items: 5,
    time: '2 days ago',
  },
  {
    id: '#ORD-2839',
    customer: 'Isabella Garcia',
    phone: '+1 234-567-8909',
    status: 'Shipped',
    amount: '$299.00',
    items: 3,
    time: '2 days ago',
  },
  {
    id: '#ORD-2838',
    customer: 'Ethan Anderson',
    phone: '+1 234-567-8910',
    status: 'Processing',
    amount: '$156.00',
    items: 2,
    time: '3 days ago',
  },
  {
    id: '#ORD-2837',
    customer: 'Mia Thomas',
    phone: '+1 234-567-8911',
    status: 'New',
    amount: '$378.00',
    items: 4,
    time: '3 days ago',
  },
  {
    id: '#ORD-2836',
    customer: 'Alexander White',
    phone: '+1 234-567-8912',
    status: 'Delivered',
    amount: '$520.00',
    items: 6,
    time: '3 days ago',
  },
];

const statusColors: Record<string, string> = {
  New: 'bg-blue-50 text-blue-700 border-blue-200',
  Processing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  Shipped: 'bg-purple-50 text-purple-700 border-purple-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
  Cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export function Orders() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter orders
  const filteredOrders = allOrders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.phone.includes(searchQuery) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Orders</h1>
          <p className="text-muted-foreground mt-1">Manage and track all your orders</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileUp className="w-4 h-4" />
            <span className="hidden sm:inline">Import Excel</span>
          </Button>
          <Button className="bg-green-600 hover:bg-green-700 gap-2">
            <Plus className="w-4 h-4" />
            Add Order
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search by Order ID, Phone, or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {Object.keys(statusColors).map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger>
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="last7">Last 7 days</SelectItem>
              <SelectItem value="last30">Last 30 days</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-border">
                <TableHead className="font-semibold">Order ID</TableHead>
                <TableHead className="font-semibold">Customer</TableHead>
                <TableHead className="font-semibold">Phone</TableHead>
                <TableHead className="font-semibold">Items</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedOrders.map((order) => (
                  <TableRow key={order.id} className="hover:bg-muted cursor-pointer">
                    <TableCell className="font-semibold text-foreground">{order.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{order.customer}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{order.phone}</TableCell>
                    <TableCell className="text-muted-foreground">{order.items} items</TableCell>
                    <TableCell className="font-medium text-foreground">{order.amount}</TableCell>
                    <TableCell>
                      <Select defaultValue={order.status}>
                        <SelectTrigger className="w-32 h-9 border-0 focus:ring-0">
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
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="p-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, filteredOrders.length)} of{' '}
              {filteredOrders.length} orders
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
              {[...Array(totalPages)].slice(0, 5).map((_, i) => (
                <Button
                  key={i}
                  variant={currentPage === i + 1 ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(i + 1)}
                  className={currentPage === i + 1 ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  {i + 1}
                </Button>
              ))}
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
        )}
      </div>
    </div>
  );
}

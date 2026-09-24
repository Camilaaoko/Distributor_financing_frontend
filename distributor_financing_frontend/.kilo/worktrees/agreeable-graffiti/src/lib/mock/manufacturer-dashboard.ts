export const statCards = [
  { label: 'Total Distributors', value: '127', delta: '12%', trend: 'positive' as const, icon: 'users' as const },
  { label: 'Outstanding Invoices', value: 'KES 34.2M', delta: '8%', trend: 'negative' as const, icon: 'invoice' as const },
  { label: 'Approved Financing', value: 'KES 82.7M', delta: '15%', trend: 'positive' as const, icon: 'financing' as const },
  { label: 'Pending Orders', value: '18', delta: '5%', trend: 'negative' as const, icon: 'orders' as const },
  { label: 'Available Inventory', value: 'KES 156.4M', delta: '10%', trend: 'positive' as const, icon: 'inventory' as const },
];

export const salesFinancingSeries = [
  { month: 'Jan', sales: 32, financing: 18 },
  { month: 'Feb', sales: 52, financing: 27 },
  { month: 'Mar', sales: 55, financing: 35 },
  { month: 'Apr', sales: 48, financing: 30 },
  { month: 'May', sales: 68, financing: 42 },
  { month: 'Jun', sales: 63, financing: 40 },
  { month: 'Jul', sales: 88, financing: 65 },
];

export type RequestStatus = 'Pending' | 'Approved' | 'Rejected';

export const financingRequests: {
  name: string;
  amount: string;
  status: RequestStatus;
  date: string;
  initial: string;
  color: string;
}[] = [
  { name: 'Sunrise Distributors', amount: 'KES 8,500,000', status: 'Pending', date: '30 Jul 2026', initial: 'SD', color: 'bg-[#1F4DA8] text-white' },
  { name: 'Premier Supplies Ltd.', amount: 'KES 12,000,000', status: 'Pending', date: '29 Jul 2026', initial: 'PS', color: 'bg-[#3A6FD8] text-white' },
  { name: 'Delta Traders', amount: 'KES 6,300,000', status: 'Approved', date: '29 Jul 2026', initial: 'DT', color: 'bg-blue-50 text-[#1F4DA8]' },
  { name: 'Rapid Link Ltd.', amount: 'KES 9,750,000', status: 'Rejected', date: '28 Jul 2026', initial: 'RL', color: 'bg-[#DC2626] text-white' },
  { name: 'Global Distributors', amount: 'KES 15,000,000', status: 'Approved', date: '28 Jul 2026', initial: 'GD', color: 'bg-blue-50 text-[#1F4DA8]' },
];

export const notifications = [
  { message: 'New financing request from Sunrise Distributors', time: '2 mins ago', icon: 'bell' as const },
  { message: 'Invoice INV-2026-1578 has been paid', time: '15 mins ago', icon: 'invoice' as const },
  { message: 'Order ORD-2026-2456 has been shipped', time: '1 hour ago', icon: 'truck' as const },
  { message: 'Inventory for Product X123 is running low', time: '3 hours ago', icon: 'inventory' as const },
  { message: 'Premier Supplies Ltd. reached 80% of credit limit', time: '5 hours ago', icon: 'users' as const },
];

export const topDistributors = [
  { name: 'Sunrise Distributors', amount: 'KES 24.5M', value: 24.5 },
  { name: 'Premier Supplies Ltd.', amount: 'KES 18.7M', value: 18.7 },
  { name: 'Global Distributors', amount: 'KES 15.2M', value: 15.2 },
  { name: 'Delta Traders', amount: 'KES 11.3M', value: 11.3 },
  { name: 'Rapid Link Ltd.', amount: 'KES 9.8M', value: 9.8 },
];

export const inventoryStatus = [
  { label: 'In Stock', amount: 'KES 98.6M', pct: '63%', value: 63, color: '#16A34A' },
  { label: 'Low Stock', amount: 'KES 32.1M', pct: '21%', value: 21, color: '#F58220' },
  { label: 'Out of Stock', amount: 'KES 15.7M', pct: '10%', value: 10, color: '#DC2626' },
  { label: 'In Transit', amount: 'KES 10.0M', pct: '6%', value: 6, color: '#1F4DA8' },
];

export type OrderStatus = 'Pending' | 'Approved' | 'Shipped';

export const recentPurchaseOrders: {
  id: string;
  distributor: string;
  status: OrderStatus;
  date: string;
}[] = [
  { id: 'ORD-2026-2456', distributor: 'Sunrise Distributors', status: 'Pending', date: '30 Jul 2026' },
  { id: 'ORD-2026-2455', distributor: 'Premier Supplies Ltd.', status: 'Pending', date: '29 Jul 2026' },
  { id: 'ORD-2026-2454', distributor: 'Global Distributors', status: 'Approved', date: '29 Jul 2026' },
  { id: 'ORD-2026-2453', distributor: 'Delta Traders', status: 'Approved', date: '28 Jul 2026' },
  { id: 'ORD-2026-2452', distributor: 'Rapid Link Ltd.', status: 'Shipped', date: '27 Jul 2026' },
];

export const paymentsSummary = [
  { label: 'Total Payments Received', value: 'KES 68.4M', delta: '14%', trend: 'positive' as const, icon: 'received' as const },
  { label: 'Outstanding Payments', value: 'KES 34.2M', delta: '8%', trend: 'negative' as const, icon: 'outstanding' as const },
  { label: 'Overdue Amount', value: 'KES 7.6M', delta: '5%', trend: 'negative' as const, icon: 'overdue' as const },
];

export const quickActions = [
  { label: 'New Financing', icon: 'financing' as const },
  { label: 'Create Invoice', icon: 'invoice' as const },
  { label: 'New Purchase Order', icon: 'orders' as const },
  { label: 'Add Product', icon: 'inventory' as const },
  { label: 'Add Distributor', icon: 'users' as const },
  { label: 'Generate Report', icon: 'report' as const },
];

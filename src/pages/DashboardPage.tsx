import { useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Users,
  ShoppingCart,
} from "lucide-react";
import { getTodayInvoices, getTodayExpenses, getLowStockProducts, getCustomersWithDebt } from "@/lib/store";
import { Link } from "react-router-dom";

export default function DashboardPage() {
  const data = useMemo(() => {
    const todayInvoices = getTodayInvoices();
    const todayExpenses = getTodayExpenses();
    const lowStock = getLowStockProducts();
    const debtCustomers = getCustomersWithDebt();

    const totalSales = todayInvoices.reduce((s, i) => s + i.total, 0);
    const totalCost = todayInvoices.reduce(
      (s, i) => s + i.items.reduce((a, it) => a + it.costPrice * it.quantity, 0), 0
    );
    const totalExpenses = todayExpenses.reduce((s, e) => s + e.amount, 0);
    const netProfit = totalSales - totalCost - totalExpenses;

    return { totalSales, totalExpenses, netProfit, lowStock, debtCustomers, invoiceCount: todayInvoices.length };
  }, []);

  const stats = [
    { label: "مبيعات اليوم", value: data.totalSales, icon: ShoppingCart, color: "text-primary" },
    { label: "مصاريف اليوم", value: data.totalExpenses, icon: TrendingDown, color: "text-destructive" },
    { label: "صافي الربح", value: data.netProfit, icon: TrendingUp, color: "text-success" },
    { label: "عدد الفواتير", value: data.invoiceCount, icon: DollarSign, color: "text-primary", isCurrency: false },
  ];

  return (
    <div>
      <h1 className="page-header">لوحة التحكم</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <stat.icon className={`${stat.color}`} size={22} />
            </div>
            <p className="text-2xl font-bold">
              {stat.isCurrency === false ? stat.value : `${stat.value.toLocaleString()} ج.م`}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low stock alert */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-warning" size={20} />
            <h3 className="font-semibold">منتجات أوشكت على النفاد</h3>
          </div>
          {data.lowStock.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد منتجات منخفضة المخزون 👍</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.lowStock.map((p) => (
                <div key={p.id} className="flex justify-between items-center p-3 rounded-lg bg-accent">
                  <span className="text-sm font-medium">{p.name}</span>
                  <span className="text-sm font-bold text-destructive">{p.quantity} قطعة</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debt customers */}
        <div className="stat-card">
          <div className="flex items-center gap-2 mb-4">
            <Users className="text-primary" size={20} />
            <h3 className="font-semibold">عملاء لديهم مديونية</h3>
          </div>
          {data.debtCustomers.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد مديونيات 👍</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {data.debtCustomers.map((c) => (
                <Link
                  key={c.id}
                  to={`/customers`}
                  className="flex justify-between items-center p-3 rounded-lg bg-accent hover:bg-accent/80 transition-colors"
                >
                  <span className="text-sm font-medium">{c.name}</span>
                  <span className="text-sm font-bold text-destructive">{c.balance.toLocaleString()} ج.م</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

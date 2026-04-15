import { useState, useMemo } from "react";
import { Search, Eye, Printer } from "lucide-react";
import { getInvoices, type Invoice } from "@/lib/store";
import InvoicePrint from "@/components/InvoicePrint";

export default function InvoicesPage() {
  const invoices = useMemo(() => getInvoices().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), []);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [printInvoice, setPrintInvoice] = useState<Invoice | null>(null);

  const filtered = useMemo(() => {
    return invoices.filter((inv) => {
      if (search.trim()) {
        const s = search.toLowerCase();
        if (!inv.customerName?.toLowerCase().includes(s) && !inv.id.includes(s)) return false;
      }
      if (dateFrom) {
        if (inv.createdAt < dateFrom) return false;
      }
      if (dateTo) {
        if (inv.createdAt > dateTo + "T23:59:59") return false;
      }
      return true;
    });
  }, [invoices, search, dateFrom, dateTo]);

  const handlePrint = (inv: Invoice) => {
    setPrintInvoice(inv);
    setTimeout(() => { window.print(); setPrintInvoice(null); }, 300);
  };

  return (
    <>
      {printInvoice && <InvoicePrint invoice={printInvoice} />}
      <div className="no-print">
        <h1 className="page-header">الفواتير ({invoices.length})</h1>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-3 text-muted-foreground" size={18} />
            <input type="text" placeholder="بحث بالعميل..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field w-full pr-10" />
          </div>
          <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="input-field" placeholder="من تاريخ" />
          <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="input-field" placeholder="إلى تاريخ" />
        </div>

        {/* Invoice detail modal */}
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30">
            <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">تفاصيل الفاتورة</h3>
                <button onClick={() => setSelectedInvoice(null)} className="text-sm text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <p className="text-sm text-muted-foreground mb-1">رقم: {selectedInvoice.id.slice(-6)}</p>
              <p className="text-sm text-muted-foreground mb-1">{new Date(selectedInvoice.createdAt).toLocaleString("ar-EG")}</p>
              {selectedInvoice.customerName && <p className="text-sm mb-4">العميل: <strong>{selectedInvoice.customerName}</strong></p>}
              
              <table className="w-full text-sm mb-4">
                <thead><tr className="border-b"><th className="text-right py-2">المنتج</th><th className="text-center py-2">الكمية</th><th className="text-center py-2">السعر</th><th className="text-left py-2">الإجمالي</th></tr></thead>
                <tbody>
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i} className="border-b"><td className="py-2">{item.productName}</td><td className="text-center">{item.quantity}</td><td className="text-center">{item.unitPrice.toLocaleString()}</td><td className="text-left">{item.total.toLocaleString()}</td></tr>
                  ))}
                </tbody>
              </table>
              <div className="space-y-1 border-t pt-3">
                <div className="flex justify-between font-bold"><span>الإجمالي</span><span>{selectedInvoice.total.toLocaleString()} ج.م</span></div>
                <div className="flex justify-between"><span>المدفوع</span><span>{selectedInvoice.paid.toLocaleString()} ج.م</span></div>
                <div className="flex justify-between font-bold text-destructive"><span>المتبقي</span><span>{selectedInvoice.remaining.toLocaleString()} ج.م</span></div>
              </div>
              <button onClick={() => handlePrint(selectedInvoice)} className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90">
                <Printer size={18} /> طباعة
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-card rounded-xl border overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-right p-3">الرقم</th>
                <th className="text-right p-3">التاريخ</th>
                <th className="text-right p-3">العميل</th>
                <th className="text-right p-3">الإجمالي</th>
                <th className="text-right p-3">المدفوع</th>
                <th className="text-right p-3">المتبقي</th>
                <th className="text-center p-3">عرض</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inv) => (
                <tr key={inv.id} className="border-b hover:bg-muted/30 cursor-pointer" onClick={() => setSelectedInvoice(inv)}>
                  <td className="p-3 font-mono text-xs">{inv.id.slice(-6)}</td>
                  <td className="p-3 text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("ar-EG")}</td>
                  <td className="p-3">{inv.customerName || "بدون عميل"}</td>
                  <td className="p-3 font-bold">{inv.total.toLocaleString()}</td>
                  <td className="p-3">{inv.paid.toLocaleString()}</td>
                  <td className={`p-3 font-bold ${inv.remaining > 0 ? "text-destructive" : "text-success"}`}>{inv.remaining.toLocaleString()}</td>
                  <td className="p-3 text-center"><Eye size={16} className="inline text-muted-foreground" /></td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد فواتير</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

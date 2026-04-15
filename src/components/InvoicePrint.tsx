import type { Invoice } from "@/lib/store";

export default function InvoicePrint({ invoice }: { invoice: Invoice }) {
  return (
    <div className="fixed inset-0 z-[9999] bg-background p-8 print:p-0" dir="rtl" style={{ fontFamily: "Cairo, sans-serif" }}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-6 border-b-2 border-foreground pb-4">
          <h1 className="text-xl font-bold">الراعي للعدد والآلات</h1>
          <p className="text-sm">موزع معتمد Fit & Apt</p>
          <p className="text-sm">إدارة أ/ مينا عيد</p>
          <p className="text-sm" dir="ltr">📞 01210004358</p>
        </div>

        {/* Invoice info */}
        <div className="flex justify-between text-sm mb-4">
          <span>فاتورة رقم: {invoice.id?.slice(-6)}</span>
          <span>{new Date(invoice.createdAt).toLocaleDateString("ar-EG")}</span>
        </div>
        {invoice.customerName && (
          <p className="text-sm mb-4">العميل: <strong>{invoice.customerName}</strong></p>
        )}

        {/* Items table */}
        <table className="w-full text-sm mb-4">
          <thead>
            <tr className="border-b-2 border-foreground">
              <th className="text-right py-2">المنتج</th>
              <th className="text-center py-2">الكمية</th>
              <th className="text-center py-2">السعر</th>
              <th className="text-left py-2">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2">{item.productName}</td>
                <td className="text-center py-2">{item.quantity}</td>
                <td className="text-center py-2">{item.unitPrice.toLocaleString()}</td>
                <td className="text-left py-2">{item.total.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer */}
        <div className="border-t-2 border-foreground pt-4 space-y-2">
          <div className="flex justify-between font-bold">
            <span>الإجمالي</span>
            <span>{invoice.total.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between">
            <span>المدفوع</span>
            <span>{invoice.paid.toLocaleString()} ج.م</span>
          </div>
          <div className="flex justify-between font-bold text-lg">
            <span>المتبقي</span>
            <span>{invoice.remaining.toLocaleString()} ج.م</span>
          </div>
        </div>

        <p className="text-center mt-8 text-sm">شكراً لتعاملكم معنا ❤️</p>
      </div>
    </div>
  );
}

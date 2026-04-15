import { useState, useMemo } from "react";
import { Search, Plus, Minus, Trash2, Printer, Check } from "lucide-react";
import { getProducts, getCustomers, addInvoice, type InvoiceItem } from "@/lib/store";
import { toast } from "@/hooks/use-toast";
import InvoicePrint from "@/components/InvoicePrint";

export default function POSPage() {
  const products = useMemo(() => getProducts(), []);
  const customers = useMemo(() => getCustomers(), []);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<InvoiceItem[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [paid, setPaid] = useState<number>(0);
  const [showPrint, setShowPrint] = useState(false);
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return products.slice(0, 20);
    const s = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(s) || (p.code && p.code.toLowerCase().includes(s))
    );
  }, [search, products]);

  const total = cart.reduce((s, i) => s + i.total, 0);
  const remaining = Math.max(0, total - paid);

  const addToCart = (product: typeof products[0]) => {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          unitPrice: product.sellPrice,
          costPrice: product.costPrice,
          total: product.sellPrice,
        },
      ]);
    }
  };

  const updateQty = (productId: string, delta: number) => {
    setCart(
      cart
        .map((i) => {
          if (i.productId !== productId) return i;
          const newQty = i.quantity + delta;
          if (newQty <= 0) return null;
          return { ...i, quantity: newQty, total: newQty * i.unitPrice };
        })
        .filter(Boolean) as InvoiceItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((i) => i.productId !== productId));
  };

  const completeSale = () => {
    if (cart.length === 0) {
      toast({ title: "خطأ", description: "الفاتورة فارغة", variant: "destructive" });
      return;
    }

    const customer = customers.find((c) => c.id === customerId);
    const invoice = addInvoice({
      items: cart,
      total,
      paid,
      remaining,
      customerId: customerId || undefined,
      customerName: customer?.name,
    });

    setLastInvoice(invoice);
    toast({ title: "تم", description: "تم إتمام عملية البيع بنجاح ✅" });
    setCart([]);
    setPaid(0);
    setCustomerId("");
  };

  const handlePrint = () => {
    if (!lastInvoice && cart.length > 0) {
      completeSale();
    }
    setShowPrint(true);
    setTimeout(() => {
      window.print();
      setShowPrint(false);
    }, 300);
  };

  const invoiceForPrint = lastInvoice || {
    items: cart, total, paid, remaining,
    customerName: customers.find((c) => c.id === customerId)?.name,
    createdAt: new Date().toISOString(),
    id: "draft",
  };

  return (
    <>
      {showPrint && <InvoicePrint invoice={invoiceForPrint} />}
      <div className="no-print">
        <h1 className="page-header">نقطة البيع</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Products search */}
          <div className="lg:col-span-3 space-y-4">
            <div className="relative">
              <Search className="absolute right-3 top-3 text-muted-foreground" size={18} />
              <input
                type="text"
                placeholder="ابحث بالاسم أو الكود..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field w-full pr-10"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto">
              {filtered.map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="stat-card text-right hover:border-primary cursor-pointer transition-colors"
                >
                  <p className="font-semibold text-sm truncate">{p.name}</p>
                  {p.brand && <p className="text-xs text-muted-foreground">{p.brand}</p>}
                  <p className="text-primary font-bold mt-2">{p.sellPrice.toLocaleString()} ج.م</p>
                  <p className="text-xs text-muted-foreground">المخزون: {p.quantity}</p>
                </button>
              ))}
              {filtered.length === 0 && (
                <p className="col-span-full text-center text-muted-foreground py-8">لا توجد منتجات</p>
              )}
            </div>
          </div>

          {/* Cart */}
          <div className="lg:col-span-2">
            <div className="stat-card">
              <h3 className="font-bold text-lg mb-4">الفاتورة</h3>

              {/* Customer select */}
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="input-field w-full mb-4"
              >
                <option value="">بدون عميل</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              {/* Cart items */}
              <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
                {cart.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between p-3 bg-accent rounded-lg">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">{item.unitPrice.toLocaleString()} ج.م</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => updateQty(item.productId, -1)} className="p-1 rounded bg-muted hover:bg-border">
                        <Minus size={14} />
                      </button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQty(item.productId, 1)} className="p-1 rounded bg-muted hover:bg-border">
                        <Plus size={14} />
                      </button>
                      <button onClick={() => removeFromCart(item.productId)} className="p-1 rounded text-destructive hover:bg-destructive/10">
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="font-bold text-sm mr-3 min-w-[70px] text-left">{item.total.toLocaleString()}</p>
                  </div>
                ))}
                {cart.length === 0 && (
                  <p className="text-center text-muted-foreground py-6">اضف منتجات للفاتورة</p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between text-lg font-bold">
                  <span>الإجمالي</span>
                  <span>{total.toLocaleString()} ج.م</span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-sm text-muted-foreground min-w-[60px]">المدفوع</label>
                  <input
                    type="number"
                    value={paid || ""}
                    onChange={(e) => setPaid(Number(e.target.value))}
                    className="input-field flex-1"
                    placeholder="0"
                  />
                </div>
                <div className="flex justify-between font-bold text-destructive">
                  <span>المتبقي</span>
                  <span>{remaining.toLocaleString()} ج.م</span>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={completeSale}
                  className="flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  <Check size={18} />
                  إتمام البيع
                </button>
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 bg-secondary text-secondary-foreground py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
                >
                  <Printer size={18} />
                  طباعة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

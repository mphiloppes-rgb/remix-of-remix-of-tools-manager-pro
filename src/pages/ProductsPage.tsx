import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, X, Check } from "lucide-react";
import { getProducts, addProduct, updateProduct, deleteProduct, type Product } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

const emptyForm = {
  name: "", code: "", brand: "", model: "",
  costPrice: 0, sellPrice: 0, quantity: 0, lowStockThreshold: 5,
};

export default function ProductsPage() {
  const [products, setProducts] = useState(() => getProducts());
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const s = search.toLowerCase();
    return products.filter(
      (p) => p.name.toLowerCase().includes(s) || p.code?.toLowerCase().includes(s) || p.brand?.toLowerCase().includes(s)
    );
  }, [search, products]);

  const openAdd = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (p: Product) => {
    setForm({
      name: p.name, code: p.code || "", brand: p.brand || "", model: p.model || "",
      costPrice: p.costPrice, sellPrice: p.sellPrice, quantity: p.quantity, lowStockThreshold: p.lowStockThreshold,
    });
    setEditId(p.id);
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) {
      toast({ title: "خطأ", description: "اسم المنتج مطلوب", variant: "destructive" });
      return;
    }
    if (editId) {
      updateProduct(editId, form);
      toast({ title: "تم التحديث ✅" });
    } else {
      addProduct(form);
      toast({ title: "تمت الإضافة ✅" });
    }
    setProducts(getProducts());
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    if (confirm("هل تريد حذف هذا المنتج؟")) {
      deleteProduct(id);
      setProducts(getProducts());
      toast({ title: "تم الحذف" });
    }
  };

  const setField = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="page-header mb-0">المنتجات ({products.length})</h1>
        <button onClick={openAdd} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90 transition-opacity">
          <Plus size={18} /> إضافة منتج
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute right-3 top-3 text-muted-foreground" size={18} />
        <input type="text" placeholder="بحث..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field w-full pr-10" />
      </div>

      {/* Product Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{editId ? "تعديل المنتج" : "إضافة منتج جديد"}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-muted-foreground">الاسم *</label>
                <input className="input-field w-full" value={form.name} onChange={(e) => setField("name", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">الكود</label>
                  <input className="input-field w-full" value={form.code} onChange={(e) => setField("code", e.target.value)} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">الماركة</label>
                  <input className="input-field w-full" value={form.brand} onChange={(e) => setField("brand", e.target.value)} />
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground">الموديل</label>
                <input className="input-field w-full" value={form.model} onChange={(e) => setField("model", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">سعر الشراء</label>
                  <input type="number" className="input-field w-full" value={form.costPrice || ""} onChange={(e) => setField("costPrice", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">سعر البيع</label>
                  <input type="number" className="input-field w-full" value={form.sellPrice || ""} onChange={(e) => setField("sellPrice", Number(e.target.value))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-muted-foreground">الكمية</label>
                  <input type="number" className="input-field w-full" value={form.quantity || ""} onChange={(e) => setField("quantity", Number(e.target.value))} />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">حد التنبيه</label>
                  <input type="number" className="input-field w-full" value={form.lowStockThreshold || ""} onChange={(e) => setField("lowStockThreshold", Number(e.target.value))} />
                </div>
              </div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90">
              <Check size={18} /> {editId ? "تحديث" : "إضافة"}
            </button>
          </div>
        </div>
      )}

      {/* Products table */}
      <div className="bg-card rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-right p-3">الاسم</th>
              <th className="text-right p-3">الكود</th>
              <th className="text-right p-3">الماركة</th>
              <th className="text-right p-3">سعر الشراء</th>
              <th className="text-right p-3">سعر البيع</th>
              <th className="text-right p-3">الكمية</th>
              <th className="text-center p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b hover:bg-muted/30 transition-colors">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted-foreground">{p.code || "-"}</td>
                <td className="p-3 text-muted-foreground">{p.brand || "-"}</td>
                <td className="p-3">{p.costPrice.toLocaleString()}</td>
                <td className="p-3 font-bold text-primary">{p.sellPrice.toLocaleString()}</td>
                <td className={`p-3 font-bold ${p.quantity <= p.lowStockThreshold ? "text-destructive" : ""}`}>{p.quantity}</td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-muted"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">لا توجد منتجات</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

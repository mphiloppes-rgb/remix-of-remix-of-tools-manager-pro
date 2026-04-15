import { useState } from "react";
import { Plus, Trash2, X, Check } from "lucide-react";
import { getExpenses, addExpense, deleteExpense, type Expense } from "@/lib/store";
import { toast } from "@/hooks/use-toast";

const expenseTypes = ["كهرباء", "مياه", "إيجار", "مواصلات", "صيانة", "أخرى"];

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState(() => getExpenses());
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", amount: 0, type: "أخرى", date: new Date().toISOString().split("T")[0] });

  const handleSave = () => {
    if (!form.name.trim() || !form.amount) {
      toast({ title: "خطأ", description: "يرجى ملء جميع الحقول", variant: "destructive" });
      return;
    }
    addExpense(form);
    setExpenses(getExpenses());
    setShowForm(false);
    setForm({ name: "", amount: 0, type: "أخرى", date: new Date().toISOString().split("T")[0] });
    toast({ title: "تمت الإضافة ✅" });
  };

  const handleDelete = (id: string) => {
    if (confirm("حذف هذا المصروف؟")) {
      deleteExpense(id);
      setExpenses(getExpenses());
    }
  };

  const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="page-header mb-0">المصاريف</h1>
        <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:opacity-90">
          <Plus size={18} /> إضافة مصروف
        </button>
      </div>

      <div className="stat-card mb-6">
        <p className="text-sm text-muted-foreground">إجمالي المصاريف</p>
        <p className="text-2xl font-bold text-destructive">{totalExpenses.toLocaleString()} ج.م</p>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30">
          <div className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">إضافة مصروف</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X size={20} /></button>
            </div>
            <div className="space-y-3">
              <div><label className="text-sm text-muted-foreground">الاسم</label><input className="input-field w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
              <div><label className="text-sm text-muted-foreground">المبلغ</label><input type="number" className="input-field w-full" value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} /></div>
              <div>
                <label className="text-sm text-muted-foreground">النوع</label>
                <select className="input-field w-full" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {expenseTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div><label className="text-sm text-muted-foreground">التاريخ</label><input type="date" className="input-field w-full" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            </div>
            <button onClick={handleSave} className="w-full mt-4 flex items-center justify-center gap-2 bg-primary text-primary-foreground py-3 rounded-lg font-bold hover:opacity-90">
              <Check size={18} /> إضافة
            </button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-right p-3">الاسم</th>
              <th className="text-right p-3">النوع</th>
              <th className="text-right p-3">المبلغ</th>
              <th className="text-right p-3">التاريخ</th>
              <th className="text-center p-3">حذف</th>
            </tr>
          </thead>
          <tbody>
            {expenses.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((e) => (
              <tr key={e.id} className="border-b hover:bg-muted/30">
                <td className="p-3 font-medium">{e.name}</td>
                <td className="p-3"><span className="px-2 py-1 bg-accent rounded-md text-xs">{e.type}</span></td>
                <td className="p-3 font-bold text-destructive">{e.amount.toLocaleString()} ج.م</td>
                <td className="p-3 text-muted-foreground">{new Date(e.date).toLocaleDateString("ar-EG")}</td>
                <td className="p-3 text-center">
                  <button onClick={() => handleDelete(e.id)} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {expenses.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">لا توجد مصاريف</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

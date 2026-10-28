import { useState } from "react";
import type { CartLine } from "../types";

const WHATSAPP_NUMBER = "201003340451";
const WHATSAPP_BACKUP = "201001254381";

export default function CartDrawer({
  open,
  onClose,
  lines,
  total,
  onIncrease,
  onDecrease,
  onRemove,
  onOrderSent,
}: {
  open: boolean;
  onClose: () => void;
  lines: CartLine[];
  total: number;
  onIncrease: (id: string) => void;
  onDecrease: (id: string) => void;
  onRemove: (id: string) => void;
  onOrderSent: () => void;
}) {
  const [step, setStep] = useState<"cart" | "checkout" | "done">("cart");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [deliveryType, setDeliveryType] = useState<"دليفري" | "تيك أواي">("دليفري");
  const [targetNumber, setTargetNumber] = useState(WHATSAPP_NUMBER);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!open) return null;

  const closeAndReset = () => {
    onClose();
    setTimeout(() => {
      setStep("cart");
      setErrors({});
    }, 300);
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "من فضلك اكتب اسمك";
    if (!phone.trim()) errs.phone = "من فضلك اكتب رقم الموبايل";
    else if (!/^0?1[0-9]{9,10}$/.test(phone.replace(/\s/g, "")))
      errs.phone = "رقم الموبايل غير صحيح";
    if (deliveryType === "دليفري" && !address.trim())
      errs.address = "من فضلك اكتب عنوان التوصيل بالتفصيل";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const getFormattedDateTime = () => {
    const now = new Date();
    try {
      const dateFormatted = now.toLocaleDateString("ar-EG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      const timeFormatted = now.toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
      return `${dateFormatted} - ${timeFormatted}`;
    } catch {
      return now.toLocaleString("ar-EG");
    }
  };

  const sendOrder = () => {
    if (!validate()) return;

    const itemsText = lines
      .map((l, idx) => `${idx + 1}- ${l.name} × ${l.qty} = ${l.price * l.qty} ج`)
      .join("\n");

    const isTakeaway = deliveryType === "تيك أواي";
    const deliveryMethodText = isTakeaway
      ? "تيك أواي (استلام من الفرع)"
      : "دليفري (توصيل للمنزل)";
    const addressText = isTakeaway
      ? "فرع مصنع سيد - شارع السبيل (بجوار سوبر ماركت القدس)"
      : address.trim();
    const notesText = notes.trim() || "لا يوجد";
    const timeFormatted = getFormattedDateTime();

    const message = `السلام عليكم ورحمة الله وبركاته 🍔
طلب جديد من موقع مطعم كاسبر أونلاين ✨
━━━━━━━━━━━━━━━━━━━━
👤 اسم العميل: ${name.trim()}
📞 رقم الهاتف: ${phone.trim()}
📍 العنوان بالتفصيل: ${addressText}
🛵 طريقة الاستلام: ${deliveryMethodText}
📝 ملاحظات إضافية: ${notesText}
━━━━━━━━━━━━━━━━━━━━
🛒 تفاصيل الأوردر (${lines.length} صنف):
${itemsText}
━━━━━━━━━━━━━━━━━━━━
💰 إجمالي الحساب المطلوب: ${total} جنيه مصري
(خدمة التوصيل تحدد حسب المنطقة)
⏰ التوقيت: ${timeFormatted}
📍 فرع المطعم: مصنع سيد - شارع السبيل (بجوار سوبر ماركت القدس)
━━━━━━━━━━━━━━━━━━━━
يرجى تأكيد استلام الأوردر وتجهيزه في أسرع وقت 🛵💨`;

    const WHATSAPP_ORDER_NUMBER = "201001254381";
    const url = `https://wa.me/${WHATSAPP_ORDER_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setStep("done");
    onOrderSent();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" dir="rtl">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={closeAndReset}
      />
      <div className="relative flex h-full w-full max-w-md flex-col bg-[#060e1c] shadow-2xl ring-1 ring-sky-500/20">
        <div className="flex items-center justify-between border-b border-sky-500/20 px-5 py-4">
          <h3 className="text-lg font-extrabold text-white">
            {step === "cart" && "🛒 سلة الطلبات"}
            {step === "checkout" && "📋 بيانات التوصيل"}
            {step === "done" && "✅ تم إرسال الطلب"}
          </h3>
          <button
            onClick={closeAndReset}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-500/10 text-sky-300 hover:bg-sky-500/30"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "cart" && (
            <>
              {lines.length === 0 ? (
                <div className="mt-16 text-center text-slate-400">
                  <p className="text-5xl">👻</p>
                  <p className="mt-3">السلة فاضية... اختار أكلك الحلو من المنيو!</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {lines.map((line) => (
                    <li
                      key={line.id}
                      className="flex items-center justify-between gap-2 rounded-xl border border-sky-500/15 bg-sky-950/40 px-3 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-white">{line.name}</p>
                        <p className="text-xs text-sky-400">{line.price} جنيه × {line.qty} = {line.price * line.qty} جنيه</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5 rounded-full border border-sky-500/40 bg-sky-950/60 px-1.5 py-1">
                          <button
                            onClick={() => onDecrease(line.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-200 hover:bg-sky-500/40"
                          >
                            −
                          </button>
                          <span className="w-4 text-center text-sm font-bold text-white">{line.qty}</span>
                          <button
                            onClick={() => onIncrease(line.id)}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/20 text-sm font-bold text-sky-200 hover:bg-sky-500/40"
                          >
                            +
                          </button>
                        </div>
                        <button
                          onClick={() => onRemove(line.id)}
                          className="text-xs font-bold text-red-400 hover:text-red-300"
                        >
                          حذف
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          {step === "checkout" && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-xs font-bold text-sky-300">طريقة الاستلام</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType("دليفري")}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-extrabold transition ${
                      deliveryType === "دليفري"
                        ? "border-sky-400 bg-sky-500 text-[#021022] shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                        : "border-sky-500/30 bg-sky-950/40 text-sky-200 hover:bg-sky-500/10"
                    }`}
                  >
                    <span>🛵</span> توصيل (دليفري)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeliveryType("تيك أواي");
                      setErrors((prev) => {
                        const next = { ...prev };
                        delete next.address;
                        return next;
                      });
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-extrabold transition ${
                      deliveryType === "تيك أواي"
                        ? "border-sky-400 bg-sky-500 text-[#021022] shadow-[0_0_15px_rgba(56,189,248,0.4)]"
                        : "border-sky-500/30 bg-sky-950/40 text-sky-200 hover:bg-sky-500/10"
                    }`}
                  >
                    <span>🛍️</span> استلام (تيك أواي)
                  </button>
                </div>
              </div>

              <Field
                label="الاسم بالكامل *"
                value={name}
                onChange={setName}
                error={errors.name}
                placeholder="مثال: محمد أحمد"
              />
              <Field
                label="رقم الهاتف (الموبايل) *"
                value={phone}
                onChange={setPhone}
                error={errors.phone}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                type="tel"
              />
              {deliveryType === "تيك أواي" ? (
                <div className="rounded-xl border border-sky-500/30 bg-sky-950/50 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-base">📍</span>
                    <span className="text-xs font-extrabold text-sky-300">مكان الاستلام (فرع المطعم):</span>
                  </div>
                  <p className="text-xs font-bold text-white pr-6 leading-relaxed">
                    مصنع سيد – شارع السبيل (بجوار سوبر ماركت القدس)
                  </p>
                  <p className="text-[11px] text-sky-400 pr-6 mt-1 font-semibold">
                    (سيتم تجهيز طلبك في الفرع لتستلمه مباشرة)
                  </p>
                </div>
              ) : (
                <Field
                  label="العنوان بالتفصيل (للتوصيل) *"
                  value={address}
                  onChange={setAddress}
                  error={errors.address}
                  placeholder="المنطقة - الشارع - رقم العمارة والشقة - علامة مميزة"
                  textarea
                />
              )}
              <Field
                label="ملاحظات إضافية (اختياري)"
                value={notes}
                onChange={setNotes}
                placeholder="مثلاً: بدون شطة، تزويد تومية..."
                textarea
              />

              <div className="rounded-xl border border-sky-500/20 bg-sky-950/40 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-sm font-bold text-sky-300">ملخص الطلب ({lines.length} صنف)</p>
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[11px] font-bold text-sky-300">
                    {deliveryType === "تيك أواي" ? "🛍️ تيك أواي" : "🛵 دليفري"}
                  </span>
                </div>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  {lines.map((l) => (
                    <li key={l.id} className="flex justify-between items-center py-0.5 border-b border-sky-500/10 last:border-0">
                      <span>▫️ {l.qty} × {l.name}</span>
                      <span className="font-bold text-sky-300">{l.price * l.qty} ج</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-2.5 flex justify-between border-t border-sky-500/20 pt-2 text-sm font-extrabold text-white">
                  <span>إجمالي الحساب المطلوب</span>
                  <span className="text-sky-300">{total} جنيه مصري</span>
                </div>
                {deliveryType === "دليفري" && (
                  <p className="mt-1 text-[11px] text-slate-400 text-center">(خدمة التوصيل تحدد حسب المنطقة)</p>
                )}
              </div>
            </div>
          )}

          {step === "done" && (
            <div className="mt-8 flex flex-col items-center gap-3 text-center">
              <p className="text-6xl">👻✅</p>
              <h4 className="text-lg font-bold text-white">تم فتح واتساب لتأكيد طلبك!</h4>
              <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                تم تجهيز رسالة الأوردر بالكامل في واتساب، فقط اضغط زر الإرسال داخل التطبيق.
              </p>
              <div className="mt-3 w-full rounded-xl border border-sky-500/20 bg-sky-950/40 p-3 text-xs text-slate-300 text-right space-y-1">
                <p className="font-bold text-sky-300">أرقام المتابعة وخدمة العملاء:</p>
                <div className="flex justify-between items-center" dir="ltr">
                  <a href="tel:01001254381" className="font-bold text-sky-300 hover:underline">01001254381</a>
                  <span className="text-slate-400">خط الطلبات والواتساب:</span>
                </div>
                <div className="flex justify-between items-center" dir="ltr">
                  <a href="tel:01003340451" className="font-bold text-sky-300 hover:underline">01003340451</a>
                  <span className="text-slate-400">خط التواصل الثاني:</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {step !== "done" && (
          <div className="border-t border-sky-500/20 bg-[#050b18] px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm font-bold text-slate-200">
              <span>الإجمالي</span>
              <span className="text-lg text-sky-300">{total} جنيه</span>
            </div>
            {step === "cart" ? (
              <button
                disabled={lines.length === 0}
                onClick={() => setStep("checkout")}
                className="w-full rounded-full bg-sky-500 py-3 text-sm font-extrabold text-[#021022] transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-40"
              >
                متابعة الطلب
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setStep("cart")}
                  className="w-1/3 rounded-full border border-sky-500/40 py-3 text-sm font-bold text-sky-200 hover:bg-sky-500/10"
                >
                  رجوع
                </button>
                <button
                  onClick={sendOrder}
                  className="flex w-2/3 items-center justify-center gap-2 rounded-full bg-green-500 py-3 text-sm font-extrabold text-[#02230f] transition hover:bg-green-400"
                >
                  تأكيد وإرسال عبر واتساب
                </button>
              </div>
            )}
          </div>
        )}
        {step === "done" && (
          <div className="border-t border-sky-500/20 bg-[#050b18] px-5 py-4">
            <button
              onClick={closeAndReset}
              className="w-full rounded-full bg-sky-500 py-3 text-sm font-extrabold text-[#021022] hover:bg-sky-400"
            >
              إغلاق
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  error,
  placeholder,
  textarea,
  dir,
  type,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  textarea?: boolean;
  dir?: "ltr" | "rtl";
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-sky-300">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={2}
          className="w-full resize-none rounded-lg border border-sky-500/30 bg-sky-950/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
        />
      ) : (
        <input
          value={value}
          dir={dir}
          type={type || "text"}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-sky-500/30 bg-sky-950/40 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:border-sky-400 focus:outline-none"
        />
      )}
      {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
    </div>
  );
}

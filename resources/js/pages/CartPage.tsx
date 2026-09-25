import { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import type { Product } from '../data/products';
import { formatPrice } from '../data/products';

interface CartPageProps {
  cart: string[];
  products: Product[];
  onNavigate: (page: string) => void;
  onRemoveFromCart: (id: string) => void;
  onClearCart: () => void;
}

type Step = 'cart' | 'details' | 'receipt';

interface CustomerInfo {
  name: string;
  contact: string;
  address: string;
  payment: string;
  notes: string;
}

const PAYMENT_OPTIONS = ['Pre-Order', 'Cash on Pickup'];

const S = {
  bg: '#0A0A0B',
  card: '#141418',
  cardHover: '#1A1A1F',
  border: '#222228',
  borderSubtle: '#1A1A20',
  text: '#F0F0F4',
  muted: '#80808C',
  faint: '#50505C',
  primary: '#FF2D78',
  primaryDark: '#CC1A5E',
  primaryGlow: 'rgba(255,45,120,0.15)',
  green: '#22C55E',
  greenBg: 'rgba(34,197,94,0.1)',
  amber: '#F59E0B',
};

const inp: React.CSSProperties = {
  backgroundColor: '#111114',
  border: '1.5px solid #222228',
  color: '#F0F0F4',
  fontFamily: 'Inter, sans-serif',
  borderRadius: '0.625rem',
  fontSize: 14,
  outline: 'none',
  width: '100%',
  padding: '11px 14px',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          color: '#80808C',
          fontFamily: 'Outfit, sans-serif',
          fontSize: 11,
          fontWeight: 700,
          display: 'block',
          marginBottom: 6,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function buildReceiptText(
  items: { product: Product; qty: number }[],
  info: CustomerInfo,
  total: number,
  receiptNo: string,
  date: string
) {
  return [
    ` PANDA'S ATTIC — ORDER REQUEST`,
    `Receipt No: ${receiptNo}`,
    `Date: ${date}`,
    `──────────────────────────`,
    `CUSTOMER`,
    `Name: ${info.name}`,
    `Contact: ${info.contact}`,
    `Address: ${info.address}`,
    `Payment: ${info.payment}`,
    info.notes ? `Notes: ${info.notes}` : '',
    `──────────────────────────`,
    `ITEMS`,
    ...items.map(
      (i) =>
        `• ${i.product.name} x${i.qty}  —  ${formatPrice(
          (i.product.salePrice ?? i.product.price) * i.qty
        )}`
    ),
    `──────────────────────────`,
    `TOTAL: ${formatPrice(total)}`,
    `──────────────────────────`,
    ` This is an ORDER REQUEST only.`,
    `Send this to us to confirm your order:`,
    `Facebook: fb.com/pandasattic`,
    `We'll reply within 24 hours. Thank you! 🐼`,
  ]
    .filter(Boolean)
    .join('\n');
}

export default function CartPage({
  cart,
  products,
  onNavigate,
  onRemoveFromCart,
  onClearCart,
}: CartPageProps) {
  const [step, setStep] = useState<Step>('cart');
  const [info, setInfo] = useState<CustomerInfo>({
    name: '',
    contact: '',
    address: '',
    payment: PAYMENT_OPTIONS[0],
    notes: '',
  });
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  // Aggregate by product id
  const itemMap = new Map<string, number>();
  for (const id of cart) itemMap.set(id, (itemMap.get(id) ?? 0) + 1);
  const items = Array.from(itemMap.entries())
    .map(([id, qty]) => ({ product: products.find((p) => p.id === id)!, qty }))
    .filter((x) => Boolean(x.product));

  const total = items.reduce(
    (s, i) => s + (i.product.salePrice ?? i.product.price) * i.qty,
    0
  );
  const receiptNo = `PA-${Date.now().toString().slice(-6)}`;
  const dateStr = new Date().toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  const receiptText = buildReceiptText(items, info, total, receiptNo, dateStr);

  function setI<K extends keyof CustomerInfo>(key: K, val: CustomerInfo[K]) {
    setInfo((prev) => ({ ...prev, [key]: val }));
  }

  const detailsValid =
    Boolean(info.name.trim()) &&
    Boolean(info.contact.trim()) &&
    Boolean(info.address.trim());

  function copyReceipt() {
    navigator.clipboard.writeText(receiptText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function downloadReceiptImage() {
    if (!receiptRef.current || downloading) return;
    setDownloading(true);

    // Swap each <img> in the receipt to a same-origin proxied copy before
    // capturing — cross-origin R2 images (even with useCORS) taint the
    // canvas and make toDataURL() throw, so this sidesteps that instead of
    // depending on R2's CORS configuration.
    const imgs = Array.from(receiptRef.current.querySelectorAll('img'));
    const originalSrcs = imgs.map((img) => img.src);

    try {
      await Promise.all(
        imgs.map(async (img, i) => {
          const original = originalSrcs[i];
          if (!original || original.startsWith('data:')) return;
          try {
            const res = await fetch(`/api/image-proxy?url=${encodeURIComponent(original)}`);
            if (!res.ok) return;
            const blob = await res.blob();
            const dataUrl: string = await new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result as string);
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
            img.src = dataUrl;
          } catch {
            // Leave this one image as-is; html2canvas will just skip it
            // rather than fail the whole capture.
          }
        })
      );

      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#0E0E12',
        scale: 2, // sharper output for a small screenshot-style card
      });
      const link = document.createElement('a');
      link.download = `receipt-${receiptNo}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('Receipt image generation failed', err);
      alert('Could not generate the receipt image. Try the "Copy Receipt Text" option instead.');
    } finally {
      imgs.forEach((img, i) => { img.src = originalSrcs[i]; });
      setDownloading(false);
    }
  }

  // Step dots
  const STEPS: { id: Step; label: string }[] = [
    { id: 'cart', label: 'Cart' },
    { id: 'details', label: 'Details' },
    { id: 'receipt', label: 'Receipt' },
  ];

  // Empty state
  if (cart.length === 0 && step === 'cart') {
    return (
      <div style={{ maxWidth: 480, margin: '0 auto', padding: '80px 16px', textAlign: 'center' }}>
        <div style={{ color: S.faint, display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <path
              d="M7 7H14L19 33H44L49 16H19"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="24" cy="45" r="4" stroke="currentColor" strokeWidth="2" />
            <circle cx="40" cy="45" r="4" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <p
          style={{
            fontFamily: 'Outfit, sans-serif',
            color: S.text,
            fontSize: 20,
            fontWeight: 700,
            marginBottom: 8,
          }}
        >
          Your cart is empty
        </p>
        <p style={{ color: S.muted, fontFamily: 'Inter, sans-serif', fontSize: 14, marginBottom: 28 }}>
          Add some figures to get started.
        </p>
        <button
          onClick={() => onNavigate('home')}
          style={{
            background: S.primary,
            color: '#fff',
            fontFamily: 'Outfit, sans-serif',
            fontSize: 14,
            fontWeight: 700,
            border: 'none',
            borderRadius: 9999,
            padding: '12px 32px',
            cursor: 'pointer',
          }}
        >
          Browse Collection
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '28px 16px 60px' }}>
      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
        {STEPS.map((s, i) => {
          const active = step === s.id;
          const done = STEPS.indexOf(STEPS.find((x) => x.id === step)!) > i;
          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                flex: i < STEPS.length - 1 ? 1 : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    border: `2px solid ${done ? S.green : active ? S.primary : S.border}`,
                    backgroundColor: done ? S.green : active ? S.primaryGlow : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.2s',
                  }}
                >
                  {done ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2 6L5 9L10 3"
                        stroke="#fff"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <span
                      style={{
                        color: active ? S.primary : S.faint,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {i + 1}
                    </span>
                  )}
                </div>
                <span
                  style={{
                    color: active ? S.text : done ? S.green : S.faint,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                  }}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: done ? S.green : S.border,
                    margin: '0 12px',
                    transition: 'background 0.2s',
                  }}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* ── STEP 1: CART ── */}
      {step === 'cart' && (
        <div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: S.text,
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            Your Cart
          </h1>
          <p
            style={{
              color: S.muted,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              marginBottom: 20,
            }}
          >
            {items.length} item{items.length !== 1 ? 's' : ''}
          </p>

          <div
            style={{
              backgroundColor: S.card,
              border: `1px solid ${S.border}`,
              borderRadius: '0.875rem',
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            {items.map((item, i) => (
              <div
                key={item.product.id}
                style={{
                  display: 'flex',
                  gap: 14,
                  padding: '14px 16px',
                  borderBottom: i < items.length - 1 ? `1px solid ${S.borderSubtle}` : 'none',
                  alignItems: 'center',
                }}
              >
                <img
                  src={item.product.images[0]}
                  alt={item.product.name}
                  style={{
                    width: 58,
                    height: 58,
                    borderRadius: '0.5rem',
                    objectFit: 'cover',
                    backgroundColor: S.border,
                    flexShrink: 0,
                    border: `1px solid ${S.border}`,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      color: S.text,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 14,
                      fontWeight: 600,
                      marginBottom: 2,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.product.name}
                  </p>
                  <p
                    style={{
                      color: S.muted,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 12,
                      marginBottom: 6,
                    }}
                  >
                    {item.product.series} · {item.product.condition}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        backgroundColor: S.primaryGlow,
                        color: S.primary,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 11,
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 9999,
                      }}
                    >
                      ×{item.qty}
                    </span>
                    <span
                      style={{
                        color: S.text,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                      }}
                    >
                      {formatPrice((item.product.salePrice ?? item.product.price) * item.qty)}
                    </span>
                    {item.product.salePrice && (
                      <span
                        style={{
                          color: S.faint,
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 11,
                          textDecoration: 'line-through',
                        }}
                      >
                        {formatPrice(item.product.price * item.qty)}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onRemoveFromCart(item.product.id)}
                  style={{
                    color: S.faint,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 6,
                    flexShrink: 0,
                    borderRadius: '0.35rem',
                    transition: 'color 0.15s',
                  }}
                  title="Remove"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M11 3L3 11M3 3L11 11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <div
            style={{
              backgroundColor: S.card,
              border: `1px solid ${S.border}`,
              borderRadius: '0.75rem',
              padding: '14px 18px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 24,
            }}
          >
            <span
              style={{
                color: S.muted,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
              }}
            >
              Order Total
            </span>
            <span
              style={{
                color: S.text,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              {formatPrice(total)}
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => onNavigate('home')}
              style={{
                color: S.muted,
                backgroundColor: S.card,
                border: `1px solid ${S.border}`,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 9999,
                padding: '12px 20px',
                cursor: 'pointer',
                flex: 1,
              }}
            >
              ← Keep Shopping
            </button>
            <button
              onClick={() => setStep('details')}
              style={{
                background: S.primary,
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 9999,
                padding: '12px 28px',
                border: 'none',
                cursor: 'pointer',
                flex: 1,
                boxShadow: `0 4px 20px ${S.primaryGlow}`,
              }}
            >
              Fill in Details →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 2: DETAILS ── */}
      {step === 'details' && (
        <div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: S.text,
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            Your Details
          </h1>
          <p
            style={{
              color: S.muted,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            This info will appear on your order receipt.
          </p>

          <div
            style={{
              backgroundColor: S.card,
              border: `1px solid ${S.border}`,
              borderRadius: '0.875rem',
              padding: 20,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
              marginBottom: 24,
            }}
          >
            <Field label="Full Name *">
              <input
                style={inp}
                value={info.name}
                onChange={(e) => setI('name', e.target.value)}
                placeholder="e.g. Juan dela Cruz"
              />
            </Field>
            <Field label="Contact Number *">
              <input
                style={inp}
                value={info.contact}
                onChange={(e) => setI('contact', e.target.value)}
                placeholder="e.g. 09XX-XXX-XXXX"
              />
            </Field>
            <Field label="Delivery Address *">
              <textarea
                style={{ ...inp, minHeight: 76, resize: 'vertical' }}
                value={info.address}
                onChange={(e) => setI('address', e.target.value)}
                placeholder="House No., Street, Barangay, City, Province"
              />
            </Field>
            <Field label="Preferred Payment">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {PAYMENT_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    onClick={() => setI('payment', opt)}
                    style={{
                      backgroundColor: info.payment === opt ? S.primary : S.card,
                      color: info.payment === opt ? '#fff' : S.muted,
                      border: `1.5px solid ${info.payment === opt ? S.primary : S.border}`,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 13,
                      fontWeight: 600,
                      borderRadius: 9999,
                      padding: '7px 16px',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Special Notes (optional)">
              <input
                style={inp}
                value={info.notes}
                onChange={(e) => setI('notes', e.target.value)}
                placeholder="e.g. No doorbell, call on arrival"
              />
            </Field>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={() => setStep('cart')}
              style={{
                color: S.muted,
                backgroundColor: S.card,
                border: `1px solid ${S.border}`,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 600,
                borderRadius: 9999,
                padding: '12px 20px',
                cursor: 'pointer',
              }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep('receipt')}
              disabled={!detailsValid}
              style={{
                background: detailsValid ? S.primary : S.border,
                color: detailsValid ? '#fff' : S.faint,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 9999,
                padding: '12px 28px',
                border: 'none',
                cursor: detailsValid ? 'pointer' : 'not-allowed',
                flex: 1,
                transition: 'all 0.15s',
                boxShadow: detailsValid ? `0 4px 20px ${S.primaryGlow}` : 'none',
              }}
            >
              Generate Receipt →
            </button>
          </div>
        </div>
      )}

      {/* ── STEP 3: RECEIPT ── */}
      {step === 'receipt' && (
        <div>
          <h1
            style={{
              fontFamily: 'Outfit, sans-serif',
              color: S.text,
              fontSize: 26,
              fontWeight: 800,
              marginBottom: 4,
            }}
          >
            Order Receipt
          </h1>
          <p
            style={{
              color: S.muted,
              fontFamily: 'Inter, sans-serif',
              fontSize: 13,
              marginBottom: 24,
            }}
          >
            Screenshot this, download it as an image, or copy the text — then send it to us on Facebook.
          </p>

          {/* Receipt card */}
          <div
            ref={receiptRef}
            style={{
              backgroundColor: '#0E0E12',
              border: `1px solid ${S.border}`,
              borderRadius: '1rem',
              overflow: 'hidden',
              marginBottom: 20,
              boxShadow: `0 0 40px rgba(255,45,120,0.08)`,
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '24px 24px 20px',
                borderBottom: `1px solid ${S.border}`,
                background: 'linear-gradient(135deg, #110814 0%, #0A0A0B 100%)',
                textAlign: 'center',
                position: 'relative',
              }}
            >
              {/* Glow */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 200,
                  height: 1,
                  background: `linear-gradient(90deg, transparent, ${S.primary}, transparent)`,
                }}
              />
              <p
                style={{
                  color: S.primary,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                Panda's Attic
              </p>
              <p
                style={{
                  color: S.text,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 18,
                  fontWeight: 800,
                  marginBottom: 2,
                }}
              >
                Order Request
              </p>
              <p style={{ color: S.faint, fontFamily: 'Inter, sans-serif', fontSize: 11 }}>
                {dateStr}
              </p>
            </div>

            {/* Receipt No + status */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '14px 24px',
                borderBottom: `1px solid ${S.borderSubtle}`,
              }}
            >
              <div>
                <p
                  style={{
                    color: S.faint,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    marginBottom: 2,
                  }}
                >
                  Receipt No.
                </p>
                <p
                  style={{
                    color: S.text,
                    fontFamily: 'Outfit, sans-serif',
                    fontSize: 14,
                    fontWeight: 800,
                  }}
                >
                  {receiptNo}
                </p>
              </div>
              <span
                style={{
                  backgroundColor: S.greenBg,
                  color: S.green,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '4px 12px',
                  borderRadius: 9999,
                  border: `1px solid rgba(34,197,94,0.2)`,
                }}
              >
                Pending Confirmation
              </span>
            </div>

            {/* Customer info */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${S.borderSubtle}`,
              }}
            >
              <p
                style={{
                  color: S.primary,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 12,
                }}
              >
                Customer
              </p>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '10px 20px',
                }}
              >
                {[
                  { label: 'Name', value: info.name },
                  { label: 'Contact', value: info.contact },
                  { label: 'Payment', value: info.payment },
                ].map((f) => (
                  <div key={f.label}>
                    <p
                      style={{
                        color: S.faint,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 2,
                      }}
                    >
                      {f.label}
                    </p>
                    <p
                      style={{
                        color: S.text,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {f.value}
                    </p>
                  </div>
                ))}
                <div style={{ gridColumn: '1 / -1' }}>
                  <p
                    style={{
                      color: S.faint,
                      fontFamily: 'Outfit, sans-serif',
                      fontSize: 10,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: 2,
                    }}
                  >
                    Address
                  </p>
                  <p
                    style={{
                      color: S.text,
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 13,
                      fontWeight: 500,
                      lineHeight: 1.5,
                    }}
                  >
                    {info.address}
                  </p>
                </div>
                {info.notes && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <p
                      style={{
                        color: S.faint,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 10,
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        marginBottom: 2,
                      }}
                    >
                      Notes
                    </p>
                    <p
                      style={{
                        color: S.text,
                        fontFamily: 'Inter, sans-serif',
                        fontSize: 13,
                        fontWeight: 500,
                      }}
                    >
                      {info.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Items */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${S.borderSubtle}`,
              }}
            >
              <p
                style={{
                  color: S.primary,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 10,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  letterSpacing: '0.12em',
                  marginBottom: 12,
                }}
              >
                Items
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 12 }}
                  >
                    <img
                      src={item.product.images[0]}
                      alt=""
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: '0.4rem',
                        objectFit: 'cover',
                        backgroundColor: S.border,
                        flexShrink: 0,
                        border: `1px solid ${S.border}`,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          color: S.text,
                          fontFamily: 'Outfit, sans-serif',
                          fontSize: 13,
                          fontWeight: 600,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {item.product.name}
                      </p>
                      <p
                        style={{
                          color: S.muted,
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 11,
                        }}
                      >
                        {item.product.series} · ×{item.qty}
                      </p>
                    </div>
                    <p
                      style={{
                        color: S.text,
                        fontFamily: 'Outfit, sans-serif',
                        fontSize: 14,
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      {formatPrice((item.product.salePrice ?? item.product.price) * item.qty)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div
              style={{
                padding: '16px 24px',
                borderBottom: `1px solid ${S.borderSubtle}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  color: S.muted,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                }}
              >
                Total
              </span>
              <span
                style={{
                  color: S.primary,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 26,
                  fontWeight: 800,
                }}
              >
                {formatPrice(total)}
              </span>
            </div>

            {/* Footer note */}
            <div
              style={{
                padding: '14px 24px',
                backgroundColor: 'rgba(255,45,120,0.04)',
              }}
            >
              <p
                style={{
                  color: S.muted,
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  lineHeight: 1.6,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                <strong style={{ color: S.text }}>This is an order request only.</strong> Send this
                receipt to us on <strong style={{ color: S.text }}>Facebook Messenger</strong> to
                confirm.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button
              onClick={downloadReceiptImage}
              disabled={downloading}
              style={{
                backgroundColor: S.primary,
                color: '#fff',
                border: `1.5px solid ${S.primary}`,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 9999,
                padding: '13px 24px',
                cursor: downloading ? 'default' : 'pointer',
                opacity: downloading ? 0.7 : 1,
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                boxShadow: '0 4px 14px rgba(255,45,120,0.3)',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1.5V9.5M7 9.5L4 6.5M7 9.5L10 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 11V12.5H12V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>{' '}
              {downloading ? 'Preparing image…' : 'Download as Image'}
            </button>

            <button
              onClick={copyReceipt}
              style={{
                backgroundColor: copied ? 'rgba(34,197,94,0.15)' : S.card,
                color: copied ? S.green : S.text,
                border: `1.5px solid ${copied ? S.green : S.border}`,
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 9999,
                padding: '13px 24px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {copied ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M2 7L5.5 10.5L12 3.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>{' '}
                  Copied!
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="4" y="4" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.2" />
                    <path d="M2 10V2H10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>{' '}
                  Copy Receipt Text
                </>
              )}
            </button>

            <button
              onClick={() => window.open('https://www.facebook.com/pandasattic', '_blank')}
              style={{
                background: 'linear-gradient(135deg, #1877F2, #0d5fcc)',
                color: '#fff',
                fontFamily: 'Outfit, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                borderRadius: 9999,
                padding: '13px 24px',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M15 8A7 7 0 1 0 1 8a7 7 0 0 0 7 7v-4.9H6V8h2V6.3C8 4.4 9.1 3.4 10.8 3.4c.8 0 1.7.1 1.7.1v1.9h-1c-.9 0-1.2.6-1.2 1.2V8h2l-.3 2.1H10.3V15A7 7 0 0 0 15 8z"
                  fill="currentColor"
                />
              </svg>
              Open Facebook Page
            </button>

            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setStep('details')}
                style={{
                  color: S.muted,
                  backgroundColor: S.card,
                  border: `1px solid ${S.border}`,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 9999,
                  padding: '11px 20px',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                ← Edit Details
              </button>
              <button
                onClick={() => {
                  onClearCart();
                  onNavigate('home');
                }}
                style={{
                  color: S.muted,
                  backgroundColor: S.card,
                  border: `1px solid ${S.border}`,
                  fontFamily: 'Outfit, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  borderRadius: 9999,
                  padding: '11px 20px',
                  cursor: 'pointer',
                  flex: 1,
                }}
              >
                Done — Back to Shop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
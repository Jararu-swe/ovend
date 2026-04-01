'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { ShoppingBagIcon, XMarkIcon, PlusIcon, MinusIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { User, Product, OrderItem, StoreTheme } from '@/app/lib/definitions';
import { formatCurrency } from '@/app/lib/utils';
import { createOrder, validateDiscountAction } from '@/app/lib/actions';
import { useSearchParams } from 'next/navigation';
import { TemplateSection, TemplateSectionContent, getDefaultSections, getDefaultSectionContent, FONT_MAP } from '@/app/lib/template-presets';
import SectionRenderer from '@/app/ui/store/section-renderer';
import ProductQuickView from '@/app/ui/store/product-quick-view';

/** Safely parse JSON with a fallback. */
function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch {
    return fallback;
  }
}



export default function Storefront({ vendor, products, theme }: { vendor: User; products: Product[]; theme: StoreTheme }) {
  const searchParams = useSearchParams();
  const isPreview = searchParams.get('preview') === 'true';
  const [previewTheme, setPreviewTheme] = useState<StoreTheme | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number; paymentMethod: 'cash' | 'card' } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [customerEmail, setCustomerEmail] = useState('');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; amount: number } | null>(null);
  const [discountError, setDiscountError] = useState('');
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const activeProducts = products.filter((p) => p.status === 'active');
  const activeTheme = useMemo(() => previewTheme ?? theme, [previewTheme, theme]);

  const sections: TemplateSection[] = useMemo(
    () => safeParse(activeTheme.sections, getDefaultSections()),
    [activeTheme.sections],
  );
  const sectionContent: TemplateSectionContent = useMemo(
    () => safeParse(activeTheme.section_content, getDefaultSectionContent()),
    [activeTheme.section_content],
  );

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const grandTotal = Math.max(0, cartTotal - (appliedDiscount?.amount || 0));

  const fontSizeClass =
    activeTheme.font_size === 'small' ? 'text-sm'
    : activeTheme.font_size === 'large' ? 'text-lg'
    : 'text-base';
  const borderRadiusClass =
    activeTheme.border_radius === 'sharp' ? 'rounded-none'
    : activeTheme.border_radius === 'pill' ? 'rounded-3xl'
    : 'rounded-2xl';
  const spacingClass =
    activeTheme.spacing === 'compact' ? 'gap-3'
    : activeTheme.spacing === 'spacious' ? 'gap-8'
    : 'gap-6';
  const imageAspectClass =
    activeTheme.image_aspect_ratio === 'portrait' ? 'aspect-[3/4]'
    : activeTheme.image_aspect_ratio === 'landscape' ? 'aspect-[4/3]'
    : 'aspect-square';
  const headerClass =
    activeTheme.header_style === 'static' ? 'border-b border-slate-200 bg-white'
    : activeTheme.header_style === 'transparent' ? 'border-b border-transparent bg-transparent'
    : 'sticky top-0 border-b border-slate-200 bg-white/80 backdrop-blur-md';

  const cardShadow = activeTheme.card_shadow ?? 'soft';
  const cardShadowStyle =
    cardShadow === 'none' ? 'shadow-none'
    : cardShadow === 'elevated' ? 'shadow-lg'
    : cardShadow === 'hard' ? 'shadow-[4px_4px_0px_rgba(0,0,0,0.1)]'
    : 'shadow-sm';

  const logoPos = activeTheme.logo_position ?? 'left';
  const logoFrame = activeTheme.logo_frame ?? 'profile';

  const logoMarkSize = logoFrame === 'minimal' ? 'h-8 w-8' : 'h-10 w-10';
  const logoFrameClass =
    logoFrame === 'profile'
      ? `${logoMarkSize} shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-slate-200`
      : logoFrame === 'rounded'
        ? `${logoMarkSize} shrink-0 overflow-hidden rounded-2xl bg-white ring-1 ring-slate-200`
        : logoFrame === 'minimal'
          ? `${logoMarkSize} shrink-0 overflow-hidden rounded-md bg-slate-50 ring-1 ring-slate-100`
          : `${logoMarkSize} shrink-0 overflow-hidden rounded-lg bg-white`;

  const initialLetter = vendor.store_name?.charAt(0) || vendor.name.charAt(0);

  // ─── Dynamic font loading ───────────────────────────────────
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  useEffect(() => {
    const fonts = new Set([activeTheme.font_family, activeTheme.heading_font]);
    fonts.forEach((f) => {
      if (f && f !== 'inter') {
        const fontName = f.charAt(0).toUpperCase() + f.slice(1);
        const family = fontName === 'Playfair' ? 'Playfair+Display' : fontName;
        const id = `gfont-${f}`;
        if (!document.getElementById(id)) {
          const link = document.createElement('link');
          link.id = id;
          link.href = `https://fonts.googleapis.com/css2?family=${family}:wght@400;500;600;700&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
        }
      }
    });

    if (document.fonts) {
      document.fonts.ready.then(() => setFontsLoaded(true));
    } else {
      setFontsLoaded(true);
    }
  }, [activeTheme.font_family, activeTheme.heading_font]);

  // ─── Interactive token mappings ─────────────────────────────
  const buttonRadiusClass = 
    activeTheme.button_radius === 'sharp' ? 'rounded-none' :
    activeTheme.button_radius === 'pill' ? 'rounded-full' : 'rounded-lg';

  const getButtonStyle = () => {
    switch (activeTheme.button_style) {
      case 'outline': return { border: `2px solid ${activeTheme.primary_color}`, color: activeTheme.primary_color, backgroundColor: 'transparent' };
      case 'soft': return { backgroundColor: `${activeTheme.primary_color}20`, color: activeTheme.primary_color, border: 'none' };
      case 'glass': return { backgroundColor: activeTheme.surface_color || '#ffffff', backdropFilter: 'blur(8px)', border: `1px solid ${activeTheme.border_color || '#e2e8f0'}`, color: activeTheme.primary_color };
      default: return { backgroundColor: activeTheme.primary_color, color: '#ffffff', border: 'none' }; // solid
    }
  };

  const getHoverAnimation = () => {
    switch (activeTheme.animation_style) {
      case 'zoom': return 'transition-transform hover:scale-110 active:scale-95 duration-300';
      case 'slide': return 'transition-transform hover:-translate-y-1 active:translate-y-0 duration-300';
      case 'bounce': return 'transition-transform hover:-translate-y-2 hover:scale-105 active:scale-95 duration-500 ease-bounce';
      case 'fade': return 'transition-opacity hover:opacity-80 active:opacity-60 duration-300';
      default: return 'transition-opacity hover:opacity-90';
    }
  };
  
  const interactionAnimationStyle = getHoverAnimation();
  const dynamicBtnStyle = getButtonStyle();

  const cartButton = (
    <button
      type="button"
      onClick={() => setIsCartOpen(true)}
      className="relative rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-50"
      style={{ '--hover-color': activeTheme.primary_color } as React.CSSProperties}
      onMouseEnter={(e) => { e.currentTarget.style.color = activeTheme.primary_color; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = ''; }}
    >
      <ShoppingBagIcon className="h-6 w-6" />
      {cartCount > 0 && (
        <span
          className="absolute top-0 right-0 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white"
          style={{ backgroundColor: activeTheme.primary_color }}
        >
          {cartCount}
        </span>
      )}
    </button>
  );

  const logoOrInitial =
    !activeTheme.show_logo ? null : activeTheme.logo_url ? (
      <div className={logoFrameClass}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={activeTheme.logo_url} alt="" className="h-full w-full object-contain p-1" />
      </div>
    ) : (
      <div
        className={`${logoFrameClass} flex items-center justify-center text-lg font-bold uppercase text-white`}
        style={{ backgroundColor: activeTheme.primary_color }}
      >
        {initialLetter}
      </div>
    );

  const titleBlock = (
    <div className={logoPos === 'center' ? 'text-center' : 'min-w-0'}>
      <h1 className="font-bold leading-tight" style={{ color: activeTheme.heading_color || activeTheme.text_color }}>
        {vendor.store_name || vendor.name}
      </h1>
      <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        ovend.app/s/{vendor.store_slug}
      </p>
    </div>
  );

  useEffect(() => {
    if (!isPreview) return;

    function handlePreviewMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'OVEND_PREVIEW_THEME_UPDATE') return;
      setPreviewTheme(event.data.payload as StoreTheme);
    }

    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, [isPreview]);

  const addToCart = (product: Product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + qty } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity - 1 } : item
        );
      }
      return prev.filter((item) => item.productId !== productId);
    });
  };

  const handleCheckoutSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    try {
      if (paymentMethod === 'card') {
        if (!customerEmail || !customerEmail.includes('@')) {
          alert('Please enter a valid email address for card payment.');
          setIsSubmitting(false);
          return;
        }

        const publicKey = 'pk_test_8f134530cff345611052399d94a474253408ab3d';
        
        if (typeof window === 'undefined' || !(window as any).PaystackPop) {
          alert('Payment system is still loading. Please wait a moment and try again.');
          setIsSubmitting(false);
          return;
        }

        // @ts-ignore
        const handler = window.PaystackPop.setup({
          key: publicKey,
          email: customerEmail,
          amount: grandTotal * 100,
          currency: 'NGN',
          ref: `OVD-${Date.now()}`,
          onClose: function() {
            setIsSubmitting(false);
          },
          callback: function(response: any) {
            fetch('/api/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ reference: response.reference }),
            })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                return createOrder(vendor.id, cart, grandTotal, formData, 'card', response.reference, appliedDiscount?.code, appliedDiscount?.amount);
              } else {
                throw new Error('Payment verification failed');
              }
            })
            .then(result => {
              if (result?.success) {
                setPlacedOrder({ id: result.id, total: grandTotal, paymentMethod: 'card' });
                setCart([]);
                setAppliedDiscount(null);
                setIsCheckingOut(false);
              }
              setIsSubmitting(false);
            })
            .catch(err => {
              console.error('Payment error:', err);
              alert('Payment verification failed. Please contact support.');
              setIsSubmitting(false);
            });
          },
        });

        handler.openIframe();
      } else {
        const result = await createOrder(vendor.id, cart, grandTotal, formData, 'cash', undefined, appliedDiscount?.code, appliedDiscount?.amount);
        if (result?.success) {
          setPlacedOrder({ id: result.id, total: grandTotal, paymentMethod: 'cash' });
          setCart([]);
          setAppliedDiscount(null);
          setIsCheckingOut(false);
        }
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      alert('Failed to place order. Please try again.');
      setIsSubmitting(false);
    }
  };

  // Inject keyframes for product grid animations (must be before any early returns)
  useEffect(() => {
    if (document.getElementById('ovd-keyframes')) return;
    const styleEl = document.createElement('style');
    styleEl.id = 'ovd-keyframes';
    styleEl.textContent = `
      @keyframes ovdFadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes ovdSlideUp { from { opacity: 0; transform: translateY(32px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes ovdZoomIn { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: scale(1); } }
      @keyframes ovdBounceIn { 0% { opacity: 0; transform: scale(0.85) translateY(20px); } 60% { opacity: 1; transform: scale(1.04) translateY(-4px); } 100% { opacity: 1; transform: scale(1) translateY(0); } }
      .ovd-fade-in { animation: ovdFadeIn 0.6s ease-out both; }
      .ovd-slide-up { animation: ovdSlideUp 0.7s cubic-bezier(0.16,1,0.3,1) both; }
      .ovd-zoom-in { animation: ovdZoomIn 0.5s ease-out both; }
      .ovd-bounce-in { animation: ovdBounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }
    `;
    document.head.appendChild(styleEl);
  }, []);

  // ─── Order confirmation screen ──────────────────────────────
  if (placedOrder) {
    const orderItemsList = cart.map(item => 
      `• ${item.quantity}x ${item.name} - ${formatCurrency(item.price * item.quantity)}`
    ).join('%0A');
    
    const message = `Hello *${vendor.store_name}*! 👋%0A%0AI just placed an order on your Ovend store:%0A%0A📦 *Order ID:* ${placedOrder.id.slice(0, 8)}%0A%0A*Items:*%0A${orderItemsList}%0A%0A💰 *Total:* ${formatCurrency(placedOrder.total)}%0A%0APlease confirm my order. Thank you!`;
    
    const whatsappLink = vendor.whatsapp_number 
      ? `https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}?text=${message}`
      : null;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <div className="mb-6 rounded-full bg-emerald-100 p-6 text-emerald-600">
          <CheckCircleIcon className="h-16 w-16" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Order Placed!</h2>
        <p className="mt-4 text-slate-500 max-w-sm">
          Your order has been sent to <strong>{vendor.store_name}</strong>.
        </p>

        {placedOrder.paymentMethod === 'cash' && vendor.bank_name && (
          <div className="mt-6 w-full max-w-md rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6">
            <h3 className="text-sm font-bold text-emerald-900 uppercase tracking-wider mb-4">
              💳 Payment Details
            </h3>
            <div className="space-y-3 text-left">
              <div>
                <p className="text-xs text-emerald-700 font-medium">Bank Name</p>
                <p className="text-base font-bold text-emerald-900">{vendor.bank_name}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-700 font-medium">Account Number</p>
                <p className="text-base font-bold text-emerald-900">{vendor.account_number}</p>
              </div>
              <div>
                <p className="text-xs text-emerald-700 font-medium">Account Name</p>
                <p className="text-base font-bold text-emerald-900">{vendor.account_name}</p>
              </div>
              <div className="pt-3 border-t border-emerald-200">
                <p className="text-xs text-emerald-700 font-medium">Amount to Pay</p>
                <p className="text-2xl font-black text-emerald-900">{formatCurrency(placedOrder.total)}</p>
              </div>
            </div>
            <p className="mt-4 text-xs text-emerald-700">
              Please transfer the exact amount and notify the vendor via WhatsApp
            </p>
          </div>
        )}

        {placedOrder.paymentMethod === 'card' && (
          <div className="mt-6 rounded-2xl bg-emerald-50 px-6 py-4 max-w-sm">
            <p className="text-sm text-emerald-700">
              ✓ Payment successful! Your order is confirmed.
            </p>
          </div>
        )}
        
        <div className="mt-8 flex flex-col w-full max-w-xs gap-3">
          {whatsappLink ? (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] p-4 font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95"
            >
              Notify via WhatsApp
            </a>
          ) : (
            <p className="text-xs text-slate-400 italic">Vendor WhatsApp not available</p>
          )}
          <button
            onClick={() => setPlacedOrder(null)}
            className="rounded-2xl bg-slate-100 p-4 font-bold text-slate-600 transition hover:bg-slate-200"
          >
            Go back to store
          </button>
        </div>
      </div>
    );
  }

  // ─── Entrance animation class mapping ────────────────────────
  const getEntranceClass = (anim: string) => {
    switch (anim) {
      case 'fade': return 'ovd-fade-in';
      case 'slide': return 'ovd-slide-up';
      case 'zoom': return 'ovd-zoom-in';
      case 'bounce': return 'ovd-bounce-in';
      default: return '';
    }
  };

  const entranceAnim = getEntranceClass(activeTheme.animation_style);

  // ─── Product grid renderer (passed to SectionRenderer) ──────
  const renderProductGrid = () => (
    <section id="item-list">
      <div className="mb-6 flex items-center justify-between">
        <h3
          className="text-lg font-bold"
          style={{ color: activeTheme.heading_color || activeTheme.text_color, fontFamily: FONT_MAP[activeTheme.heading_font] || undefined }}
        >Products</h3>
        <span className="text-xs text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-100 italic">
          {activeProducts.length} items available
        </span>
      </div>

      <div className={`grid ${spacingClass} ${
        activeTheme.layout_style === 'grid' ? 'grid-cols-1 sm:grid-cols-2' :
        activeTheme.layout_style === 'list' ? 'grid-cols-1' :
        'grid-cols-1 sm:grid-cols-2'
      }`}>
        {activeProducts.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 py-16 px-6 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            <ShoppingBagIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
            <h4 className="text-lg font-bold text-slate-700 mb-2">No products available yet</h4>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              This store looks amazing, but the vendor is still adding their products to the shelves. Please check back later!
            </p>
          </div>
        ) : (
          activeProducts.map((product, idx) => {
            let parsedOptions = [];
          try {
            if (product.options) parsedOptions = JSON.parse(product.options);
          } catch (e) {}
          
          const hasOptions = parsedOptions.length > 0;
          const isOutOfStock = product.stock_quantity !== null && product.stock_quantity <= 0;
          const isOnSale = product.compare_at_price && product.compare_at_price > product.price;

          return (
          <div
            key={product.id}
            onClick={() => setQuickViewProduct(product)}
            className={`group flex flex-col overflow-hidden bg-white border transition-all hover:shadow-lg cursor-pointer ${cardShadowStyle} ${entranceAnim} ${
              activeTheme.card_style === 'modern' ? 'rounded-3xl border-slate-100' :
              activeTheme.card_style === 'classic' ? 'rounded-xl border-slate-200' :
              activeTheme.card_style === 'minimal' ? 'rounded-lg border-transparent' :
              'rounded-2xl border-4'
            } ${isOutOfStock ? 'opacity-70' : ''}`}
            style={{
              animationDelay: `${idx * 80}ms`,
              ...(activeTheme.card_style === 'bold' ? { 
                borderColor: activeTheme.primary_color,
                boxShadow: `4px 4px 0 ${activeTheme.primary_color}40`,
              } : {
                borderColor: activeTheme.border_color || undefined,
              }),
            }}
          >
            {activeTheme.show_product_images && (
              <div className={`${imageAspectClass} relative flex items-center justify-center bg-slate-50 text-slate-200 overflow-hidden`}>
                {product.image_url ? (
                  <Image
                    src={product.image_url}
                    alt={product.name}
                    fill
                    className={`object-cover transition-transform group-hover:scale-110 duration-500 ${isOutOfStock ? 'grayscale' : ''}`}
                  />
                ) : (
                  <ShoppingBagIcon className="h-16 w-16" />
                )}
                
                {/* Sale and Stock Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                  {isOnSale && !isOutOfStock && (
                    <span className="rounded-full bg-red-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      Sale
                    </span>
                  )}
                  {isOutOfStock && (
                    <span className="rounded-full bg-slate-800 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
                      Sold Out
                    </span>
                  )}
                </div>

                {/* Category Badge */}
                {product.category && (
                  <div className="absolute bottom-3 left-3 font-semibold text-[10px] bg-white/90 backdrop-blur-sm text-slate-700 px-2 py-1 rounded-lg">
                    {product.category}
                  </div>
                )}
              </div>
            )}
            <div className="flex flex-1 flex-col p-5">
              <h4
                className="font-bold leading-snug mb-1 line-clamp-2"
                style={{ color: activeTheme.heading_color || activeTheme.text_color, fontFamily: FONT_MAP[activeTheme.heading_font] || undefined }}
              >
                {product.name}
              </h4>
              {activeTheme.show_product_description && (
                <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                  {product.description}
                </p>
              )}
              <div className="mt-4 flex items-end justify-between pt-4 border-t border-slate-50">
                <div className="flex flex-col">
                  {isOnSale && (
                     <span className="text-xs text-slate-400 line-through mb-0.5">{formatCurrency(product.compare_at_price!)}</span>
                  )}
                  <p className="text-lg font-bold" style={{ color: activeTheme.primary_color }}>
                    {formatCurrency(product.price)}
                  </p>
                </div>

                <button 
                  disabled={isOutOfStock}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (hasOptions || isOutOfStock) {
                      setQuickViewProduct(product);
                    } else {
                      addToCart(product); 
                    }
                  }}
                  className={`flex shrink-0 items-center justify-center font-bold text-white shadow-lg ${buttonRadiusClass} ${interactionAnimationStyle} ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{...dynamicBtnStyle, padding: hasOptions ? '0.5rem 1rem' : '', height: '2.5rem', width: hasOptions ? 'auto' : '2.5rem', fontSize: '0.875rem' }}
                >
                  {isOutOfStock ? (
                    'Sold'
                  ) : hasOptions ? (
                    'Options'
                  ) : (
                    <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
                  )}
                </button>
              </div>
            </div>
          </div>
          );
        })
        )}
      </div>
    </section>
  );

  const applyDiscountCode = async () => {
    if (!discountCodeInput.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError('');
    try {
      const res = await validateDiscountAction(vendor.id, discountCodeInput.trim(), cartTotal);
      if (res.valid && res.discount) {
        const d = res.discount;
        const amount = d.discount_type === 'percentage' 
          ? Math.floor((cartTotal * d.discount_value) / 100)
          : Math.min(d.discount_value, cartTotal);
        setAppliedDiscount({ code: d.code, amount });
      } else {
        setDiscountError(res.error || 'Invalid code');
        setAppliedDiscount(null);
      }
    } catch (e) {
      setDiscountError('Error validating code');
    } finally {
      setIsApplyingDiscount(false);
    }
  };

  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCodeInput('');
    setDiscountError('');
  };

  return (
    <>
      {activeTheme.custom_css && (
        <style dangerouslySetInnerHTML={{ __html: activeTheme.custom_css.replace(/<\/style>/gi, '') }} />
      )}
      <div 
        className={`min-h-screen ${fontSizeClass} transition-opacity duration-500 ease-in-out ${fontsLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{
        '--color-primary': activeTheme.primary_color,
        '--color-secondary': activeTheme.secondary_color,
        '--color-background': activeTheme.background_color,
        '--color-text': activeTheme.text_color,
        '--color-accent': activeTheme.accent_color,
        backgroundColor: activeTheme.background_color,
        color: activeTheme.text_color,
        fontFamily: FONT_MAP[activeTheme.font_family] || activeTheme.font_family,
      } as React.CSSProperties}
    >
      {/* Store Header */}
      <header className={`z-10 ${headerClass}`}>
        <div className="mx-auto max-w-2xl px-4 py-4">
          {logoPos === 'center' ? (
            <div className="relative flex min-h-[4.5rem] flex-col items-center pt-1">
              <div className="absolute right-0 top-0 z-10">{cartButton}</div>
              <div className="flex flex-col items-center gap-2">
                {logoOrInitial}
                {titleBlock}
              </div>
            </div>
          ) : logoPos === 'right' ? (
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">{titleBlock}</div>
              <div className="flex shrink-0 items-center gap-2">
                {logoOrInitial}
                {cartButton}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {logoOrInitial}
                {titleBlock}
              </div>
              {cartButton}
            </div>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 pb-32">
        <SectionRenderer
          sections={sections}
          content={sectionContent}
          vendor={vendor}
          products={products}
          theme={activeTheme}
          onAddToCart={addToCart}
          renderProductGrid={renderProductGrid}
        />
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && !isCartOpen && (
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 z-10">
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`flex w-full items-center justify-between p-4 font-bold text-white shadow-2xl ${buttonRadiusClass} ${interactionAnimationStyle}`}
            style={dynamicBtnStyle}
          >
            <span>{cartCount} items in cart</span>
            <span className="flex items-center gap-2">
              View Cart <ArrowRightIcon className="h-5 w-5" strokeWidth={2.5} />
            </span>
          </button>
        </footer>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsCartOpen(false)} />
          <div className="absolute inset-y-0 right-0 flex max-w-full">
            <div className="w-screen max-w-md transform bg-white shadow-2xl transition-transform duration-300 ease-in-out">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-100 px-6 py-6 font-bold text-slate-900">
                  <h2 className="text-xl">Your Cart</h2>
                  <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {cart.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <ShoppingBagIcon className="h-12 w-12 text-slate-300" />
                      <p className="mt-4 text-slate-500">Your cart is empty.</p>
                      <button 
                         onClick={() => setIsCartOpen(false)}
                         className="mt-6 text-sm font-bold text-emerald-600 hover:text-emerald-500"
                      >
                         Continue shopping
                      </button>
                    </div>
                  ) : (
                    <ul className="space-y-6">
                      {cart.map((item) => (
                        <li key={item.productId} className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-bold text-slate-900">{item.name}</h4>
                            <p className="text-sm font-semibold" style={{ color: activeTheme.primary_color }}>{formatCurrency(item.price)}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => removeFromCart(item.productId)}
                              className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            >
                              <MinusIcon className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                            <span className="w-4 text-center font-bold text-slate-900">{item.quantity}</span>
                            <button 
                              onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price } as Product)}
                              className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition"
                            >
                              <PlusIcon className="h-4 w-4" strokeWidth={2.5} />
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-slate-100 px-6 py-8">
                    {!isCheckingOut && !appliedDiscount && (
                      <div className="mb-6 flex flex-col gap-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Promo Code"
                            value={discountCodeInput}
                            onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm uppercase outline-none focus:border-emerald-500 transition"
                          />
                          <button
                            onClick={applyDiscountCode}
                            disabled={isApplyingDiscount || !discountCodeInput.trim()}
                            className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 shadow-md"
                            style={{ backgroundColor: activeTheme.primary_color }}
                          >
                            {isApplyingDiscount ? '...' : 'Apply'}
                          </button>
                        </div>
                        {discountError && <p className="text-xs font-medium text-red-500 px-2">{discountError}</p>}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 mb-6">
                      <div className="flex items-center justify-between text-sm text-slate-500 font-medium tracking-wide">
                        <span>Subtotal</span>
                        <span>{formatCurrency(cartTotal)}</span>
                      </div>
                      
                      {appliedDiscount && (
                        <div className="flex items-center justify-between text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-2.5 rounded-xl border border-emerald-100">
                          <div className="flex items-center gap-2">
                            <span>Discount ({appliedDiscount.code})</span>
                            <button onClick={removeDiscount} className="rounded-full bg-emerald-200 text-emerald-700 hover:bg-emerald-300 w-5 h-5 flex items-center justify-center text-sm transition">×</button>
                          </div>
                          <span>-{formatCurrency(appliedDiscount.amount)}</span>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-lg font-black text-slate-900 mt-2 pt-4 border-t border-slate-100">
                        <span>Total</span>
                        <span>{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                    
                    {!isCheckingOut ? (
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl p-4 font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95"
                        style={{ backgroundColor: activeTheme.primary_color }}
                      >
                        Checkout Order <ArrowRightIcon className="h-5 w-5" strokeWidth={2.5} />
                      </button>
                    ) : (
                      <form onSubmit={handleCheckoutSubmit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1 italic">Full Name</label>
                          <input 
                            name="customer_name" 
                            required 
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 transition" 
                            placeholder="Amaka Obi"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1 italic">Email Address</label>
                          <input 
                            name="customer_email" 
                            type="email"
                            required 
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 transition" 
                            placeholder="you@example.com"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1 italic">WhatsApp Number</label>
                          <input 
                            name="customer_phone" 
                            required 
                            type="tel"
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 transition" 
                            placeholder="+234 801 234 5678"
                          />
                        </div>
                        
                        {/* Payment Method */}
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2 italic">Payment Method</label>
                          <div className="grid grid-cols-2 gap-3">
                            <label className="relative flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                              <input type="radio" name="payment_method" value="cash" checked={paymentMethod === 'cash'} onChange={() => setPaymentMethod('cash')} className="hidden sr-only" />
                              <span className="text-sm font-bold text-slate-700">Cash/Transfer</span>
                            </label>
                            <label className="relative flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                              <input type="radio" name="payment_method" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="hidden sr-only" />
                              <span className="text-sm font-bold text-slate-700">💳 Card</span>
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <label className="relative flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                            <input type="radio" name="delivery_type" value="delivery" defaultChecked className="hidden sr-only" />
                            <span className="text-sm font-bold text-slate-700">Delivery</span>
                          </label>
                          <label className="relative flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                            <input type="radio" name="delivery_type" value="pickup" className="hidden sr-only" />
                            <span className="text-sm font-bold text-slate-700">Pickup</span>
                          </label>
                        </div>
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-1 italic">Delivery Address (optional)</label>
                          <textarea 
                            name="customer_address" 
                            rows={2}
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 transition" 
                            placeholder="Enter your delivery address..."
                          />
                        </div>
                        <div className="flex gap-2">
                           <button 
                            type="button" 
                            onClick={() => setIsCheckingOut(false)}
                            className="flex-1 rounded-2xl bg-slate-100 p-4 font-bold text-slate-600 transition hover:bg-slate-200"
                           >
                            Back
                           </button>
                           <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`flex-[2] p-4 font-bold text-white shadow-lg disabled:opacity-50 ${buttonRadiusClass} ${interactionAnimationStyle}`}
                            style={dynamicBtnStyle}
                           >
                            {isSubmitting ? 'Processing...' : paymentMethod === 'card' ? 'Pay Now' : 'Confirm Order'}
                           </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Product Quick View Modal */}
      <ProductQuickView
        product={quickViewProduct}
        theme={activeTheme}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={addToCart}
      />
    </div>
    </>
  );
}

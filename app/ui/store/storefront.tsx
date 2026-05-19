'use client';

import { useEffect, useMemo, useState, useCallback } from 'react';
import Image from 'next/image';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { User, Product, OrderItem, StoreTheme } from '@/app/lib/definitions';
import type { StoreAvailability } from '@/app/lib/store-availability';
import {
  formatCurrency,
  getCardStyleClasses,
  getCardShadowClass,
  getCardHoverEffect,
  getSectionSpacing,
  getButtonStyles,
  getBorderRadiusClass,
} from '@/app/lib/utils';
import { createOrder, validateDiscountAction } from '@/app/lib/actions';
import { useSound } from '@/app/lib/sound-manager';
import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';

const LocationPicker = dynamic(() => import('./location-picker'), { ssr: false });
import { TemplateSection, TemplateSectionContent, getDefaultSections, getDefaultSectionContent, FONT_MAP } from '@/app/lib/template-presets';
import SectionRenderer from '@/app/ui/store/section-renderer';
import ProductQuickView from '@/app/ui/store/product-quick-view';
import DynamicNav from '@/app/ui/store/nav-renderers';
import { StoreAvailabilityBanner } from '@/app/ui/store/store-availability-badge';
import StoreIcon from '@/app/ui/store/storefront-icons';
import { CldImage } from 'next-cloudinary';

/** Safely parse JSON with a fallback. */
function safeParse<T>(json: string | null | undefined, fallback: T): T {
  if (!json) return fallback;
  try {
    return typeof json === 'string' ? JSON.parse(json) : json;
  } catch {
    return fallback;
  }
}

/** Helper function to get button styling based on theme */
function useButtonProps(theme: StoreTheme) {
  const radiusClass =
    theme.button_radius === 'sharp' ? 'rounded-none' :
    theme.button_radius === 'pill' ? 'rounded-full' : 'rounded-xl';

  const style = (() => {
    switch (theme.button_style) {
      case 'outline': return { border: `2px solid ${theme.primary_color}`, color: theme.primary_color, backgroundColor: 'transparent' };
      case 'soft': return { backgroundColor: `${theme.primary_color}18`, color: theme.primary_color, border: 'none' };
      case 'glass': return { backgroundColor: `${theme.surface_color || '#fff'}cc`, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: `1px solid ${theme.border_color || '#e2e8f0'}`, color: theme.primary_color };
      default: return { backgroundColor: theme.primary_color, color: '#ffffff', border: 'none' };
    }
  })();

  const hover = (() => {
    switch (theme.animation_style) {
      case 'zoom': return 'hover:scale-105 active:scale-95';
      case 'slide': return 'hover:-translate-y-1 active:translate-y-0';
      case 'bounce': return 'hover:-translate-y-1.5 hover:scale-[1.03] active:scale-95';
      case 'fade': return 'hover:opacity-80 active:opacity-60';
      default: return 'hover:opacity-90';
    }
  })();

  return { radiusClass, style, hover, className: `transition-all duration-300 ${radiusClass} ${hover} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2` };
}




export default function Storefront({
  vendor,
  products,
  theme,
  customer,
  availability,
}: {
  vendor: User;
  products: Product[];
  theme: StoreTheme;
  customer?: any;
  availability: StoreAvailability;
}) {
  const searchParams = useSearchParams();
  const { playSound } = useSound();
  const isPreview = searchParams.get('preview') === 'true';
  const [previewTheme, setPreviewTheme] = useState<StoreTheme | null>(null);
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number; paymentMethod: 'cash' | 'card' } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [customerEmail, setCustomerEmail] = useState(customer?.email || '');
  const [deliveryType, setDeliveryType] = useState<'delivery' | 'pickup'>('delivery');
  const [deliveryLocation, setDeliveryLocation] = useState<{ lat: number; lng: number; details?: string } | null>(
    customer?.delivery_latitude && customer?.delivery_longitude
      ? { lat: customer.delivery_latitude, lng: customer.delivery_longitude, details: customer.delivery_address_details || '' }
      : null
  );
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

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

  // Memoized callback to prevent infinite loop in LocationPicker
  const handleLocationSelect = useCallback((lat: number, lng: number, details?: string) => {
    setDeliveryLocation({ lat, lng, details });
  }, []);

  const fontSizeClass =
    activeTheme.font_size === 'small' ? 'text-sm'
    : activeTheme.font_size === 'large' ? 'text-lg'
    : 'text-base';
  const borderRadiusClass = getBorderRadiusClass(activeTheme.border_radius as any);
  const spacingClass =
    activeTheme.spacing === 'compact' ? 'gap-3'
    : activeTheme.spacing === 'spacious' ? 'gap-8'
    : 'gap-6';
  const imageAspectClass =
    activeTheme.image_aspect_ratio === 'portrait' ? 'aspect-[3/4]'
    : activeTheme.image_aspect_ratio === 'landscape' ? 'aspect-[4/3]'
    : 'aspect-square';
  const headerClass =
    activeTheme.header_style === 'static' ? 'relative z-[100]'
    : activeTheme.header_style === 'transparent' ? 'absolute top-0 left-0 right-0 z-[100] bg-transparent'
    : 'sticky top-0 z-[100] transition-all duration-300';

  const headerStyles = {
    backgroundColor: activeTheme.header_style === 'transparent' 
      ? 'transparent' 
      : activeTheme.glass_effect 
        ? `${activeTheme.surface_color || '#ffffff'}cc` 
        : (activeTheme.surface_color || '#ffffff'),
    backdropFilter: activeTheme.header_style !== 'transparent' && activeTheme.glass_effect ? 'blur(16px)' : undefined,
    WebkitBackdropFilter: activeTheme.header_style !== 'transparent' && activeTheme.glass_effect ? 'blur(16px)' : undefined,
    borderColor: activeTheme.header_style === 'transparent' 
      ? 'transparent' 
      : activeTheme.card_style === 'bold' 
        ? activeTheme.primary_color 
        : (activeTheme.border_color || '#e2e8f0'),
    borderBottomWidth: activeTheme.header_style === 'transparent' ? '0px' : activeTheme.card_style === 'bold' ? '3.5px' : activeTheme.card_style === 'minimal' ? '0px' : '1px',
    boxShadow: activeTheme.header_style === 'transparent' ? 'none' : getCardShadowClass(activeTheme.card_shadow || 'soft'),
    color: activeTheme.header_style === 'transparent' ? '#ffffff' : activeTheme.text_color,
    textShadow: activeTheme.header_style === 'transparent' ? '0 1px 4px rgba(0,0,0,0.25)' : 'none',
  };

  const cardShadow = activeTheme.card_shadow ?? 'soft';
  const cardShadowStyle =
    cardShadow === 'none' ? 'shadow-none'
    : cardShadow === 'elevated' ? 'shadow-lg'
    : cardShadow === 'hard' ? 'shadow-[4px_4px_0px_rgba(0,0,0,0.1)]'
    : 'shadow-sm';

  const layoutWidthClass = 
    activeTheme.layout_width === 'wide' ? 'max-w-6xl' :
    activeTheme.layout_width === 'full' ? 'max-w-none' :
    'max-w-2xl';

  const logoPos = activeTheme.logo_position ?? 'left';
  const logoFrame = (activeTheme.logo_frame ?? 'profile') as string;
  const isTransparentHeader = activeTheme.header_style === 'transparent';

  // Detect if this is a "dark" theme surface so we can invert the frame colors
  const isDarkSurface = (() => {
    const hex = (activeTheme.surface_color || '#ffffff').replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.4;
  })();

  // Frame bg / ring adapts to dark vs light theme surfaces
  const frameBg = isDarkSurface
    ? (activeTheme.surface_color || '#1a1a1a')
    : '#ffffff';
  const frameRing = isDarkSurface ? 'rgba(255,255,255,0.12)' : '#e2e8f0';

  // On transparent headers, add a subtle backdrop so the logo is always readable
  const transparentFrameStyle = isTransparentHeader
    ? { backgroundColor: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)', boxShadow: '0 0 0 1px rgba(255,255,255,0.15)' }
    : {};

  const logoMarkSize = logoFrame === 'minimal' ? 'h-8 w-8' : 'h-10 w-10';

  // 'none' / 'plain' = no decorative wrapper; other frames get a shaped container
  const hasLogoFrame = logoFrame !== 'none' && logoFrame !== 'plain';

  const logoFrameClass = !hasLogoFrame
    ? `${logoMarkSize} shrink-0 overflow-hidden`
    : logoFrame === 'profile'
      ? `${logoMarkSize} shrink-0 overflow-hidden rounded-full`
      : logoFrame === 'rounded'
        ? `${logoMarkSize} shrink-0 overflow-hidden ${borderRadiusClass}`
        : logoFrame === 'minimal'
          ? `${logoMarkSize} shrink-0 overflow-hidden ${borderRadiusClass}`
          : `${logoMarkSize} shrink-0 overflow-hidden ${borderRadiusClass}`;

  // Inline style for logo frame (bg + ring, adapted to dark/transparent)
  const logoFrameStyle: React.CSSProperties = !hasLogoFrame
    ? {}
    : isTransparentHeader
      ? transparentFrameStyle
      : {
          backgroundColor: frameBg,
          boxShadow: `0 0 0 1.5px ${frameRing}`,
        };

  const initialLetter = vendor.store_name?.charAt(0) || vendor.name.charAt(0);

  // ─── Dynamic font loading ───────────────────────────────────
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  useEffect(() => {
    const fontFamilyMap: Record<string, string> = {
      poppins: 'Poppins',
      roboto: 'Roboto',
      playfair: 'Playfair+Display',
      montserrat: 'Montserrat',
      outfit: 'Outfit',
      dmSans: 'DM+Sans',
      spaceGrotesk: 'Space+Grotesk',
    };
    const fonts = new Set([activeTheme.font_family, activeTheme.heading_font]);
    fonts.forEach((f) => {
      if (f && f !== 'inter') {
        const family = fontFamilyMap[f] || f.charAt(0).toUpperCase() + f.slice(1);
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
  const btnProps = getButtonStyles(activeTheme);

  const handleShare = async () => {
    const url = window.location.href.split('?')[0]; // strip preview params
    const title = `${vendor.store_name} on Vendle`;
    if (navigator.share) {
      try { await navigator.share({ title, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Store link copied to clipboard!');
    }
  };

  // Shared icon button style for header actions (share & cart) — kept visually consistent
  const headerIconColor = isTransparentHeader ? 'rgba(255,255,255,0.92)' : activeTheme.text_color;
  const headerIconBg = isTransparentHeader ? 'rgba(255,255,255,0.12)' : `${activeTheme.primary_color}0d`;
  const headerIconHoverBg = isTransparentHeader ? 'rgba(255,255,255,0.2)' : `${activeTheme.primary_color}18`;
  const boldBorder = activeTheme.card_style === 'bold'
    ? `2px solid ${isTransparentHeader ? 'rgba(255,255,255,0.4)' : activeTheme.primary_color}`
    : 'none';

  const cartButton = (
    <div className="flex items-center gap-1">
      {/* Share button — same pill/box visual as cart */}
      <button
        type="button"
        onClick={handleShare}
        className={`flex items-center justify-center h-10 w-10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${borderRadiusClass} ${activeTheme.animation_style === 'zoom' ? 'hover:scale-110 active:scale-90' : 'hover:brightness-110'}`}
        style={{ 
          color: headerIconColor,
          backgroundColor: headerIconBg,
          border: boldBorder,
          '--tw-ring-color': activeTheme.primary_color 
        } as React.CSSProperties}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = headerIconHoverBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = headerIconBg; }}
        title="Share this store"
      >
        <StoreIcon name="share" theme={activeTheme} className="h-5 w-5" />
      </button>
      {/* Cart button */}
      <button
        type="button"
        onClick={() => setIsCartOpen(true)}
        className={`relative flex items-center justify-center h-10 px-3 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${borderRadiusClass} ${activeTheme.animation_style === 'bounce' ? 'hover:-translate-y-0.5' : 'hover:brightness-110'}`}
        style={{ 
          color: headerIconColor,
          '--tw-ring-color': activeTheme.primary_color,
          backgroundColor: headerIconBg,
          border: boldBorder,
        } as React.CSSProperties}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = headerIconHoverBg; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = headerIconBg; }}
      >
        <StoreIcon name="cart" theme={activeTheme} className="h-5 w-5" />
        {cartCount > 0 && (
          <span
            className="ml-1.5 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1 text-[10px] font-black text-white shadow-sm ring-1 ring-white/20"
            style={{ backgroundColor: activeTheme.primary_color }}
          >
            {cartCount}
          </span>
        )}
      </button>
    </div>
  );

  const logoOrInitial =
    !(activeTheme.show_logo ?? true) ? null : activeTheme.logo_url ? (
      <div className={logoFrameClass} style={logoFrameStyle}>
        {activeTheme.logo_url.includes('cloudinary.com') ? (
          <CldImage
            src={activeTheme.logo_url}
            alt={vendor.store_name || vendor.name}
            width={100}
            height={100}
            crop="thumb"
            gravity="center"
            className={`h-full w-full object-contain ${hasLogoFrame ? 'p-1' : ''}`}
          />
        ) : (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={activeTheme.logo_url}
            alt=""
            className={`h-full w-full object-contain ${hasLogoFrame ? 'p-1' : ''}`}
          />
        )}
      </div>
    ) : (
      // Initial letter avatar — always uses primary color as bg for brand consistency
      // 'none'/'plain' frames get a smaller, cleaner look without the ring
      <div
        className={`${logoFrameClass} flex items-center justify-center text-base font-bold uppercase`}
        style={{
          ...logoFrameStyle,
          // For framed styles, override bg with primary color so it's branded
          backgroundColor: hasLogoFrame ? activeTheme.primary_color : 'transparent',
          // For transparent headers with no frame, add a subtle backdrop
          ...(isTransparentHeader && !hasLogoFrame ? transparentFrameStyle : {}),
          color: '#ffffff',
          // Ensure minimum size even for frameless logos
          minWidth: '2.5rem',
          minHeight: '2.5rem',
          borderRadius: logoFrame === 'profile' ? '50%'
            : logoFrame === 'rounded' || logoFrame === 'minimal'
              ? (activeTheme.border_radius === 'pill' ? '9999px' : activeTheme.border_radius === 'sharp' ? '0' : '0.5rem')
            : logoFrame === 'none' || logoFrame === 'plain' ? '0.375rem'
            : '50%',
        }}
      >
        {initialLetter}
      </div>
    );

  const titleBlock = (
    <div className="min-w-0 flex flex-col justify-center">
      <h1 
        className="font-bold leading-none text-base md:text-xl tracking-tight line-clamp-1" 
        style={{ 
          color: activeTheme.header_style === 'transparent' ? '#ffffff' : (activeTheme.heading_color || activeTheme.text_color),
          fontFamily: FONT_MAP[activeTheme.heading_font] || undefined
        }}
      >
        {vendor.store_name || vendor.name}
      </h1>
      <p 
        className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] mt-1.5 opacity-60 line-clamp-1"
        style={{ color: activeTheme.header_style === 'transparent' ? '#ffffff' : activeTheme.text_color }}
      >
        vendle.app/s/{vendor.store_slug}
      </p>
    </div>
  );

  useEffect(() => {
    if (!isPreview) return;

    function handlePreviewMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type !== 'VENDLE_PREVIEW_THEME_UPDATE') return;
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
          metadata: {
            delivery_latitude: deliveryLocation?.lat,
            delivery_longitude: deliveryLocation?.lng,
            delivery_address_details: deliveryLocation?.details
          },
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
                if (deliveryLocation) {
                  formData.append('delivery_latitude', deliveryLocation.lat.toString());
                  formData.append('delivery_longitude', deliveryLocation.lng.toString());
                  formData.append('delivery_address_details', deliveryLocation.details || '');
                }
                return createOrder(vendor.id, cart, grandTotal, formData, 'card', response.reference, appliedDiscount?.code, appliedDiscount?.amount);
              } else {
                throw new Error('Payment verification failed');
              }
            })
            .then(result => {
              if (result?.success) {
                playSound('success');
                setPlacedOrder({ id: result.id, total: grandTotal, paymentMethod: 'card' });
                setCart([]);
                setAppliedDiscount(null);
                setIsCheckingOut(false);
              }
              setIsSubmitting(false);
            })
            .catch(err => {
              console.error('Payment error:', err);
              playSound('error');
              alert('Payment verification failed. Please contact support.');
              setIsSubmitting(false);
            });
          },
        });

        if (handler && typeof handler.openIframe === 'function') {
          handler.openIframe();
        } else {
          console.error('Paystack handler not initialized');
          alert('Unable to initialize payment. Please try again.');
          setIsSubmitting(false);
        }
      } else {
        await handleCashCheckout(formData);
        setIsSubmitting(false);
        setIsCheckingOut(false);
      }
    } catch (err) {
      console.error(err);
      playSound('error');
      alert('Order failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCashCheckout = async (formData: FormData) => {
    if (deliveryLocation) {
      formData.append('delivery_latitude', deliveryLocation.lat.toString());
      formData.append('delivery_longitude', deliveryLocation.lng.toString());
      formData.append('delivery_address_details', deliveryLocation.details || '');
    }
    const result = await createOrder(vendor.id, cart, grandTotal, formData, 'cash', undefined, appliedDiscount?.code, appliedDiscount?.amount);
    if (result.success) {
      playSound('success');
      setPlacedOrder({ id: result.id, total: grandTotal, paymentMethod: 'cash' });
      setCart([]);
      setIsCartOpen(true);
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
    
    const message = `Hello *${vendor.store_name}*! 👋%0A%0AI just placed an order on your Vendle store:%0A%0A📦 *Order ID:* ${placedOrder.id.slice(0, 8)}%0A%0A*Items:*%0A${orderItemsList}%0A%0A💰 *Total:* ${formatCurrency(placedOrder.total)}%0A%0APlease confirm my order. Thank you!`;
    
    const whatsappLink = vendor.whatsapp_number 
      ? `https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}?text=${message}`
      : null;

    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 text-center">
        <div className="mb-6 rounded-full bg-emerald-100 p-6 text-emerald-600">
          <CheckCircleIcon className="h-16 w-16" />
        </div>
        <h2 className="text-3xl font-black text-slate-900">Order Placed!</h2>
        <p className="mt-2 text-sm font-mono text-slate-400">Order ID: {placedOrder.id.slice(0, 8)}</p>
        <p className="mt-3 text-slate-500 max-w-sm">
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
              className="flex items-center justify-center gap-2 rounded-2xl bg-[#25D366] p-4 font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2"
            >
              Notify via WhatsApp
            </a>
          ) : (
            <p className="text-xs text-slate-400 italic">Vendor WhatsApp not available</p>
          )}
          <a
            href="/order-status"
            className="flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 bg-white p-4 font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
          >
            📦 Track your order
          </a>
          <button
            onClick={() => setPlacedOrder(null)}
            className="rounded-2xl bg-slate-100 p-4 font-bold text-slate-600 transition hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
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
  const renderProductGrid = () => {
    // Get button props using the helper
    const btn = useButtonProps(activeTheme);
    
    // Get card styling classes
    const cardStyleClasses = getCardStyleClasses(
      activeTheme.card_style || 'modern',
      activeTheme.border_radius || 'rounded'
    );
    const cardShadowClass = getCardShadowClass(activeTheme.card_shadow || 'soft');
    const cardHoverEffect = getCardHoverEffect(activeTheme.card_style || 'modern');

    return (
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
        activeTheme.layout_style === 'grid' ? (activeTheme.layout_width === 'standard' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4') :
        activeTheme.layout_style === 'list' ? 'grid-cols-1' :
        (activeTheme.layout_width === 'standard' ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4')
      }`}>
        {activeProducts.length === 0 ? (
          <div className="col-span-1 sm:col-span-2 py-16 px-6 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
            <StoreIcon name="cart" theme={activeTheme} className="mx-auto h-12 w-12 text-slate-300 mb-4" />
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
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setQuickViewProduct(product); } }}
            tabIndex={0}
            role="button"
            aria-label={`View details for ${product.name}`}
            className={`group flex flex-col overflow-hidden bg-white cursor-pointer ${cardStyleClasses} ${cardShadowClass} ${cardHoverEffect} ${entranceAnim} ${isOutOfStock ? 'opacity-70' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
            style={{
              animationDelay: `${idx * 80}ms`,
              ...(activeTheme.card_style === 'bold' ? { 
                borderColor: activeTheme.primary_color,
                boxShadow: `4px 4px 0 ${activeTheme.primary_color}40`,
              } : {
                borderColor: activeTheme.border_color || undefined,
              }),
              ['--tw-ring-color' as any]: activeTheme.primary_color,
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
                  <>
                    <StoreIcon name="cart" theme={activeTheme} className="h-12 w-12" />
                    <span className="text-xs font-medium mt-1">No image</span>
                  </>
                )}
                
                {/* Sale and Stock Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2 items-start">
                  {isOnSale && !isOutOfStock && (
                    <span className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm" style={{ backgroundColor: activeTheme.accent_color }}>
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

                {/* Share Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const productUrl = `${window.location.origin}/s/${vendor.store_slug}/p/${product.id}`;
                    if (navigator.share) {
                      navigator.share({
                        title: product.name,
                        text: product.description || `Check out ${product.name}`,
                        url: productUrl,
                      }).catch(() => {});
                    } else {
                      navigator.clipboard.writeText(productUrl);
                      // Could add a toast notification here
                    }
                  }}
                  className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm text-slate-600 shadow-sm transition-all hover:bg-white hover:scale-110 focus-visible:outline-none focus-visible:ring-2"
                  style={{ ['--tw-ring-color' as any]: activeTheme.primary_color }}
                  title="Share product"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186 9.566-5.314m-9.566 7.5 9.566 5.314m0 0a2.25 2.25 0 1 0 3.935 2.186 2.25 2.25 0 0 0-3.935-2.186Zm0-12.814a2.25 2.25 0 1 0 3.933-2.185 2.25 2.25 0 0 0-3.933 2.185Z" />
                  </svg>
                </button>
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
                  className={`flex shrink-0 items-center justify-center font-bold shadow-lg ${btn.className} ${
                    isOutOfStock ? 'opacity-50 cursor-not-allowed' : ''
                  } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2`}
                  style={{...btn.style, padding: hasOptions ? '0.5rem 1rem' : '', height: '2.5rem', width: hasOptions ? 'auto' : '2.5rem', fontSize: '0.875rem', ['--tw-ring-color' as any]: activeTheme.primary_color }}
                >
                  {isOutOfStock ? (
                    'Sold'
                  ) : hasOptions ? (
                    'Options'
                  ) : (
                    <StoreIcon name="add" theme={activeTheme} className="h-5 w-5" />
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
};

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
      {/* Boutique-specific global styles */}
      {activeTheme.template_id === 'luxe-boutique' && (
        <style>{`
          @keyframes boutiqueFadeDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes boutiqueLineGrow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
          @keyframes boutiqueHeroReveal { from { opacity: 0; letter-spacing: 0.35em; } to { opacity: 1; letter-spacing: 0.12em; } }
          @keyframes boutiqueSubReveal { from { opacity: 0; transform: translateY(10px); } to { opacity: 0.75; transform: translateY(0); } }
          .btq-fade-down { animation: boutiqueFadeDown 0.7s cubic-bezier(0.16,1,0.3,1) both; }
          .btq-line-grow { animation: boutiqueLineGrow 1s cubic-bezier(0.16,1,0.3,1) both; transform-origin: left; }
          .btq-hero-reveal { animation: boutiqueHeroReveal 1.4s cubic-bezier(0.16,1,0.3,1) 0.1s both; }
          .btq-sub-reveal { animation: boutiqueSubReveal 1s cubic-bezier(0.16,1,0.3,1) 0.5s both; }
        `}</style>
      )}
      {/* Tech Store-specific global styles */}
      {activeTheme.template_id === 'tech-store' && (
        <style>{`
          @keyframes techScanPulse { 0%,100% { opacity: 0.7; } 50% { opacity: 1; } }
          @keyframes techGlowIn { from { opacity: 0; transform: translateY(-6px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes techCartBounce { 0%,100% { transform: scale(1); } 30% { transform: scale(1.25); } 60% { transform: scale(0.9); } }
          .tch-glow-in { animation: techGlowIn 0.5s cubic-bezier(0.16,1,0.3,1) both; }
          .tch-scan { animation: techScanPulse 3s ease-in-out infinite; }
          .tch-cart-bounce { animation: techCartBounce 0.4s cubic-bezier(0.34,1.56,0.64,1); }
        `}</style>
      )}
      {/* Beauty-specific global styles */}
      {activeTheme.template_id === 'beauty-glow' && (
        <style>{`
          @keyframes beautyFadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .bty-fade-up { animation: beautyFadeIn 1s ease-out forwards; }
          .bty-delay-1 { animation-delay: 0.3s; }
          .bty-delay-2 { animation-delay: 0.6s; }
        `}</style>
      )}
      {/* Midnight-specific global styles */}
      {activeTheme.template_id === 'midnight-luxe' && (
        <style>{`
          @keyframes midnightReveal { from { opacity: 0; filter: blur(10px); transform: scale(0.95); } to { opacity: 1; filter: blur(0); transform: scale(1); } }
          @keyframes midnightFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
          .mdn-reveal { animation: midnightReveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both; }
          .mdn-float { animation: midnightFloat 6s ease-in-out infinite; }
          .mdn-delay-1 { animation-delay: 0.2s; }
          .mdn-delay-2 { animation-delay: 0.4s; }
        `}</style>
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
      <DynamicNav
        vendor={vendor}
        theme={activeTheme}
        cartCount={cartCount}
        handleShare={handleShare}
        setIsCartOpen={setIsCartOpen}
        layoutWidthClass={layoutWidthClass}
      />

      <div className={`mx-auto w-full px-4 ${layoutWidthClass}`}>
        <StoreAvailabilityBanner
          availability={availability}
          borderColor={activeTheme.border_color || '#e2e8f0'}
          textColor={activeTheme.text_color}
        />
      </div>

      <main 
        className={`mx-auto px-4 pb-32 ${layoutWidthClass} ${
          ['luxe-boutique', 'beauty-glow', 'midnight-luxe', 'vogue-minimal'].includes(activeTheme.template_id) ? 'pt-0' :
          activeTheme.template_id === 'tech-store' ? 'pt-8' :
          activeTheme.header_style === 'transparent' && sections[0]?.id !== 'hero-banner' ? 'pt-24' : 'pt-8'
        }`}
      >
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

      {/* ─── Branded Store Footer ─── */}
      <footer
        className={`mx-auto px-4 pb-24 pt-8 ${layoutWidthClass}`}
      >
        <div
          className="border-t pt-8 flex flex-col items-center gap-3 text-center"
          style={{ borderColor: activeTheme.border_color || '#e2e8f0' }}
        >
          <p
            className="text-sm font-semibold"
            style={{ color: activeTheme.heading_color || activeTheme.text_color }}
          >
            {vendor.store_name || vendor.name}
          </p>
          <p className="text-xs" style={{ color: activeTheme.text_color, opacity: 0.5 }}>
            Powered by{' '}
            <a
              href="https://vendle.app"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 rounded"
              style={{ color: activeTheme.primary_color, '--tw-ring-color': activeTheme.primary_color } as React.CSSProperties}
            >
              Vendle
            </a>
            {' · '}
            {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* Floating Cart Button (Standard) */}
      {cartCount > 0 && !isCartOpen && !activeTheme.show_mobile_checkout_bar && (
        <footer className={`fixed bottom-0 left-1/2 -translate-x-1/2 w-full p-4 z-10 ${layoutWidthClass}`}>
          <button 
            onClick={() => setIsCartOpen(true)}
            className={`flex w-full items-center justify-center p-4 font-bold text-white shadow-2xl ${getButtonStyles(activeTheme).className}`}
            style={{ ...getButtonStyles(activeTheme).style, ['--tw-ring-color' as any]: activeTheme.primary_color }}
          >
            <span>{cartCount} items in cart</span>
            <span className="flex items-center gap-2">
              View Cart <StoreIcon name="chevron-right" theme={activeTheme} className="h-5 w-5" />
            </span>
          </button>
        </footer>
      )}

      {/* Sticky Mobile Checkout Bar (Premium) */}
      {cartCount > 0 && !isCartOpen && activeTheme.show_mobile_checkout_bar && (
        <div className="fixed bottom-0 left-0 right-0 z-30 p-4 sm:hidden">
          <div 
            className="flex items-center justify-between gap-4 p-3 pr-2 pl-4 shadow-2xl backdrop-blur-xl border border-white/20 rounded-full bg-white/90"
            style={{...activeTheme.glass_effect ? { backdropFilter: 'blur(16px)', backgroundColor: 'rgba(255,255,255,0.7)'} : {}}}
          >
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total</span>
              <span className="text-base font-black text-slate-900">{formatCurrency(cartTotal)}</span>
            </div>
            <button
              onClick={() => setIsCartOpen(true)}
              className={`flex items-center gap-2 px-6 py-2.5 font-bold text-white ${btnProps.className}`}
              style={{ ...btnProps.style, backgroundColor: activeTheme.primary_color }}
            >
              Checkout
              <StoreIcon name="chevron-right" theme={activeTheme} className="h-4 w-4" />
            </button>
          </div>
        </div>
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
                  <button onClick={() => setIsCartOpen(false)} className="rounded-full p-2 hover:bg-slate-50 text-slate-400 hover:text-slate-600 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400">
                    <StoreIcon name="close" theme={activeTheme} className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  {cart.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <StoreIcon name="cart" theme={activeTheme} className="h-12 w-12 text-slate-300" />
                      <p className="mt-4 text-slate-500">Your cart is empty.</p>
                      <button 
                         onClick={() => setIsCartOpen(false)}
                         className="mt-6 text-sm font-bold text-emerald-600 hover:text-emerald-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 rounded-lg px-2 py-1"
                      >
                         Continue shopping
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8 pb-10">
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
                                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                aria-label="Decrease quantity"
                              >
                                <StoreIcon name="minus" theme={activeTheme} className="h-4 w-4" />
                              </button>
                              <span className="w-4 text-center font-bold text-slate-900">{item.quantity}</span>
                              <button 
                                onClick={() => addToCart({ id: item.productId, name: item.name, price: item.price } as Product)}
                                className="h-8 w-8 flex items-center justify-center rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                                aria-label="Increase quantity"
                              >
                                <StoreIcon name="plus" theme={activeTheme} className="h-4 w-4" />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>

                      {/* Summary Section (Moved inside scrollable area) */}
                      <div className="pt-8 border-t border-slate-100">
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
                                className="rounded-xl px-4 py-2 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                                style={{ backgroundColor: activeTheme.primary_color, '--tw-ring-color': activeTheme.primary_color } as React.CSSProperties}
                              >
                                {isApplyingDiscount ? '...' : 'Apply'}
                              </button>
                            </div>
                            {discountError && <p className="text-xs font-medium text-red-600 px-2">{discountError}</p>}
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
                                <button onClick={removeDiscount} className="rounded-full bg-emerald-200 text-emerald-700 hover:bg-emerald-300 w-5 h-5 flex items-center justify-center text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500" aria-label="Remove discount">×</button>
                              </div>
                              <span>-{formatCurrency(appliedDiscount.amount)}</span>
                            </div>
                          )}

                          <div className="flex items-center justify-between text-lg font-black text-slate-900 mt-2 pt-4 border-t border-slate-100">
                            <span>Total</span>
                            <span>{formatCurrency(grandTotal)}</span>
                          </div>
                        </div>

                        {/* Checkout Form (Moved inside scrollable area) */}
                        {isCheckingOut && (
                          <div className="pt-8 border-t border-slate-100">
                            <form onSubmit={handleCheckoutSubmit} className="space-y-6">
                              <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1 italic">Full Name</label>
                                <input 
                                  name="customer_name" 
                                  required 
                                  defaultValue={customer?.name || ''}
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
                                  defaultValue={customer?.whatsapp_number || ''}
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
                                  <input type="radio" name="delivery_type" value="delivery" checked={deliveryType === 'delivery'} onChange={() => setDeliveryType('delivery')} className="hidden sr-only" />
                                  <span className="text-sm font-bold text-slate-700">Delivery</span>
                                </label>
                                <label className="relative flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 p-3 transition hover:bg-slate-50 has-[:checked]:border-emerald-500 has-[:checked]:bg-emerald-50">
                                  <input type="radio" name="delivery_type" value="pickup" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} className="hidden sr-only" />
                                  <span className="text-sm font-bold text-slate-700">Pickup</span>
                                </label>
                              </div>
                              
                              {deliveryType === 'delivery' ? (
                                <div className="space-y-4">
                                  <LocationPicker 
                                    onLocationSelect={handleLocationSelect} 
                                  />
                                  <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1 italic">General Address (optional)</label>
                                    <textarea 
                                      name="customer_address" 
                                      rows={2}
                                      className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 transition" 
                                      placeholder="Enter your general neighborhood or area..."
                                    />
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <label className="block text-sm font-bold text-slate-700 mb-1 italic">Pickup Note (optional)</label>
                                  <textarea 
                                    name="customer_address" 
                                    rows={2}
                                    className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 transition" 
                                    placeholder="Any note about your pickup..."
                                  />
                                </div>
                              )}

                              <div className="flex gap-3">
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
                                  className={`flex-[2] p-4 font-bold text-white shadow-lg disabled:opacity-50 ${getButtonStyles(activeTheme).className}`}
                                  style={{ ...getButtonStyles(activeTheme).style, backgroundColor: activeTheme.primary_color }}
                                >
                                  {isSubmitting ? 'Processing...' : paymentMethod === 'card' ? 'Pay Now' : 'Confirm Order'}
                                </button>
                              </div>
                            </form>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {!isCheckingOut && cart.length > 0 && (
                  <div className="border-t border-slate-100 px-6 py-8">
                    <button 
                      onClick={() => {
                        if (!customer) {
                          setShowAuthModal(true);
                        } else {
                          setIsCheckingOut(true);
                        }
                      }}
                      className="flex w-full items-center justify-center gap-2 rounded-2xl p-4 font-bold text-white shadow-lg transition hover:opacity-90 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{ backgroundColor: activeTheme.primary_color, '--tw-ring-color': activeTheme.primary_color } as React.CSSProperties}
                    >
                      Checkout Order <StoreIcon name="chevron-right" theme={activeTheme} className="h-5 w-5" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Auth Gate Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowAuthModal(false)} />
          {/* Modal */}
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl">
            {/* Close */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              aria-label="Close"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>

            <div className="mb-6 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${activeTheme.primary_color}18` }}>
                <svg className="h-7 w-7" style={{ color: activeTheme.primary_color }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
              <h2 className="text-xl font-black text-slate-900">Sign in to checkout faster</h2>
              <p className="mt-1.5 text-sm text-slate-500">Save your details and track your order history, or continue as a guest.</p>
            </div>

            <div className="space-y-3">
              <a
                href={`/customer/login?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '/')}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 font-bold text-white transition hover:opacity-90 active:scale-95"
                style={{ backgroundColor: activeTheme.primary_color }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg>
                Sign In
              </a>
              <a
                href={`/customer/signup?callbackUrl=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '/')}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 py-3 font-bold transition hover:bg-slate-50 active:scale-95"
                style={{ borderColor: activeTheme.primary_color, color: activeTheme.primary_color }}
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                Create Account
              </a>
              <button
                onClick={() => { setShowAuthModal(false); setIsCheckingOut(true); }}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 active:scale-95"
              >
                Continue as Guest
              </button>
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

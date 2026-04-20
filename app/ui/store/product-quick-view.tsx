'use client';

import { Product, StoreTheme } from '@/app/lib/definitions';
import { FONT_MAP } from '@/app/lib/template-presets';
import { formatCurrency } from '@/app/lib/utils';
import StoreIcon from '@/app/ui/store/storefront-icons';
import Image from 'next/image';
import { useState, useEffect, useCallback, useMemo } from 'react';

interface ProductQuickViewProps {
  product: Product | null;
  theme: StoreTheme;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export default function ProductQuickView({
  product,
  theme,
  onClose,
  onAddToCart,
}: ProductQuickViewProps) {
  const [quantity, setQuantity] = useState(1);
  const [isVisible, setIsVisible] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Safe parse for gallery
  const galleryImages = useMemo<string[]>(() => {
    let extra: string[] = [];
    if (product?.gallery_images) {
      try {
        extra = JSON.parse(product.gallery_images);
      } catch {}
    }
    const all = [];
    if (product?.image_url) all.push(product.image_url);
    return all.concat(extra);
  }, [product?.image_url, product?.gallery_images]);

  // Safe parse for options
  const options = useMemo<{id: string; name: string; price: string}[]>(() => {
    if (!product?.options) return [];
    try {
      return JSON.parse(product.options);
    } catch {
      return [];
    }
  }, [product?.options]);

  const selectedOption = useMemo(() => {
    return options.find(o => o.id === selectedOptionId) || null;
  }, [selectedOptionId, options]);

  const activePrice = selectedOption && selectedOption.price ? Number(selectedOption.price) : product?.price || 0;
  
  const hasOptions = options.length > 0;
  const isOutOfStock = product?.stock_quantity !== null && product?.stock_quantity !== undefined && product.stock_quantity <= 0;
  const stockLimit = product?.stock_quantity ?? Infinity;
  const isOnSale = product?.compare_at_price && product.compare_at_price > (product?.price || 0) && !selectedOption;

  // Animate in
  useEffect(() => {
    if (product) {
      setQuantity(1);
      setAddedFeedback(false);
      setImageZoomed(false);
      setActiveImageIndex(0);
      setSelectedOptionId(options.length > 0 ? options[0].id : null);
      requestAnimationFrame(() => setIsVisible(true));
    } else {
      setIsVisible(false);
    }
  }, [product, options]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  });

  const handleClose = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onClose(), 300);
  }, [onClose]);

  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    
    // Create a modified product payload for the cart
    const cartProduct = {
      ...product,
      name: selectedOption ? `${product.name} (${selectedOption.name})` : product.name,
      price: activePrice
    };

    onAddToCart(cartProduct, quantity);
    setAddedFeedback(true);
    setTimeout(() => {
      setAddedFeedback(false);
      handleClose();
    }, 1200);
  };

  const handleShare = async () => {
    if (!product) return;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: product.name, text: product.description, url });
    } else {
      await navigator.clipboard.writeText(`${product.name} — ${url}`);
      alert('Link copied!');
    }
  };

  // ─── Style computations ─────────────────────────────────────
  const buttonRadiusClass =
    theme.button_radius === 'sharp' ? 'rounded-none' :
    theme.button_radius === 'pill' ? 'rounded-full' : 'rounded-xl';

  const getButtonStyle = () => {
    switch (theme.button_style) {
      case 'outline': return { border: `2px solid ${theme.primary_color}`, color: theme.primary_color, backgroundColor: 'transparent' };
      case 'soft': return { backgroundColor: `${theme.primary_color}18`, color: theme.primary_color, border: 'none' };
      case 'glass': return { backgroundColor: `${theme.surface_color || '#fff'}cc`, backdropFilter: 'blur(12px)', border: `1px solid ${theme.border_color || '#e2e8f0'}`, color: theme.primary_color };
      default: return { backgroundColor: theme.primary_color, color: '#ffffff', border: 'none' };
    }
  };

  const borderRadiusStyle = theme.border_radius === 'sharp' ? '0' : theme.border_radius === 'pill' ? '1.5rem' : '1rem';
  const btnStyle = getButtonStyle();

  if (!product) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Modal Panel */}
      <div
        className={`absolute inset-x-0 bottom-0 max-h-[92vh] transform transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] flex flex-col ${
          isVisible ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div
          className="relative mx-auto w-full max-w-2xl flex flex-col flex-1 overflow-hidden bg-white shadow-2xl"
          style={{ borderRadius: `${borderRadiusStyle} ${borderRadiusStyle} 0 0` }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-10 rounded-full bg-slate-300" />
          </div>

          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 z-[70] flex h-8 w-8 items-center justify-center rounded-full bg-black/20 text-white backdrop-blur-sm transition hover:bg-black/40 shadow-md"
          >
            <StoreIcon name="close" theme={theme} className="h-5 w-5" />
          </button>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto overscroll-contain pb-[100px]">
            {/* Product Image */}
            {galleryImages.length > 0 ? (
              <div className="flex flex-col">
                <div
                  className="relative aspect-square w-full overflow-hidden bg-slate-50 cursor-zoom-in group"
                  onClick={() => setImageZoomed(!imageZoomed)}
                >
                  <Image
                    src={galleryImages[activeImageIndex]}
                    alt={`${product.name} - image ${activeImageIndex + 1}`}
                    fill
                    className={`object-cover transition-transform duration-500 ${
                      imageZoomed ? 'scale-150' : 'scale-100'
                    } ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
                    sizes="(max-width: 672px) 100vw, 672px"
                    priority
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                     {isOnSale && !isOutOfStock && (
                       <span className="rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md" style={{ backgroundColor: theme.accent_color }}>
                         Sale
                       </span>
                     )}
                     {isOutOfStock && (
                       <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                         Sold Out
                       </span>
                     )}
                  </div>
                  
                  {product.category && (
                    <div className="absolute bottom-4 left-4 z-10">
                      <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 shadow-sm border border-slate-100">
                        {product.category}
                      </span>
                    </div>
                  )}
                  
                  {/* Zoom indicator */}
                  <div className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 rounded-full bg-black/40 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm shadow-md opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607ZM10.5 7.5v6m3-3h-6" />
                    </svg>
                    {imageZoomed ? 'Zoom out' : 'Zoom in'}
                  </div>
                </div>
                
                {/* Thumbnails */}
                {galleryImages.length > 1 && (
                  <div className="flex gap-2 overflow-x-auto p-4 snap-x hide-scrollbar border-b border-slate-100">
                    {galleryImages.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative aspect-square w-16 shrink-0 snap-center overflow-hidden rounded-xl border-2 transition-all ${
                          activeImageIndex === idx ? 'border-emerald-500 shadow-md scale-105' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                        style={activeImageIndex === idx ? { borderColor: theme.primary_color } : {}}
                      >
                        <Image src={img} alt="" fill className="object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="aspect-square flex items-center justify-center bg-slate-50 text-slate-200 relative">
                 <StoreIcon name="cart" theme={theme} className="h-20 w-20" />
                 {product.category && (
                  <div className="absolute bottom-4 left-4 z-10">
                    <span className="rounded-full bg-white/90 backdrop-blur-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-700 border border-slate-200">
                      {product.category}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-4">
                  <h2
                    className="text-xl font-bold leading-tight"
                    style={{
                      color: theme.heading_color || theme.text_color,
                      fontFamily: FONT_MAP[theme.heading_font] || theme.heading_font,
                    }}
                  >
                    {product.name}
                  </h2>
                  <button
                    onClick={handleShare}
                    className="shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200"
                    title="Share product"
                  >
                    <StoreIcon name="share" theme={theme} className="h-4 w-4" />
                  </button>
                </div>
                <div className="mt-2 flex items-end gap-3">
                  {isOnSale && (
                     <span className="text-base text-slate-400 line-through mb-[2px]">{formatCurrency(product.compare_at_price!)}</span>
                  )}
                  <p
                    className="text-3xl font-black"
                    style={{ color: theme.primary_color }}
                  >
                    {formatCurrency(activePrice)}
                  </p>
                </div>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border" style={{ backgroundColor: `${theme.accent_color}15`, color: theme.accent_color, borderColor: `${theme.accent_color}30` }}>
                    Out of Stock
                  </span>
                ) : stockLimit <= 5 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border" style={{ backgroundColor: `${theme.secondary_color}15`, color: theme.secondary_color, borderColor: `${theme.secondary_color}30` }}>
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.secondary_color }} />
                    Only {stockLimit} left in stock
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold border"
                    style={{
                      backgroundColor: `${theme.primary_color}12`,
                      color: theme.primary_color,
                      borderColor: `${theme.primary_color}30`
                    }}
                  >
                    <span className="h-1.5 w-1.5 rounded-full animate-pulse" style={{ backgroundColor: theme.primary_color }} />
                    In Stock
                  </span>
                )}
              </div>

              {/* Options Selector */}
              {hasOptions && (
                 <div>
                    <h3
                      className="text-sm font-bold mb-3"
                      style={{
                        color: theme.heading_color || theme.text_color,
                        fontFamily: FONT_MAP[theme.heading_font] || undefined,
                      }}
                    >
                      Select an Option
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {options.map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedOptionId(opt.id)}
                          className={`relative flex flex-col items-center justify-center p-3 rounded-xl border-2 text-sm transition-all ${
                            selectedOptionId === opt.id 
                              ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
                              : 'border-slate-200 bg-white hover:border-emerald-200'
                          }`}
                          style={selectedOptionId === opt.id ? {
                            borderColor: theme.primary_color,
                            backgroundColor: `${theme.primary_color}12`
                          } : {}}
                        >
                          <span className={`font-bold ${selectedOptionId === opt.id ? '' : 'text-slate-700'}`} style={selectedOptionId === opt.id ? { color: theme.primary_color } : {}}>
                            {opt.name}
                          </span>
                          {opt.price && (
                             <span className="text-xs font-medium text-slate-500 mt-1">
                               {formatCurrency(Number(opt.price))}
                             </span>
                          )}
                        </button>
                      ))}
                    </div>
                 </div>
              )}

              {/* Description */}
              {product.description && (
                <div>
                  <h3
                    className="text-sm font-bold mb-2"
                    style={{
                      color: theme.heading_color || theme.text_color,
                      fontFamily: FONT_MAP[theme.heading_font] || undefined,
                    }}
                  >
                    Description
                  </h3>
                  <p
                    className="text-sm leading-relaxed whitespace-pre-wrap"
                    style={{ color: theme.text_color, opacity: 0.85 }}
                  >
                    {product.description}
                  </p>
                </div>
              )}

              {/* Quantity Selector */}
              {!isOutOfStock && (
              <div>
                <h3
                  className="text-sm font-bold mb-3"
                  style={{
                    color: theme.heading_color || theme.text_color,
                    fontFamily: FONT_MAP[theme.heading_font] || undefined,
                  }}
                >
                  Quantity
                </h3>
                <div className="flex items-center gap-4">
                  <div
                    className="inline-flex items-center border overflow-hidden bg-white shadow-sm"
                    style={{
                      borderColor: theme.border_color || '#e2e8f0',
                      borderRadius: borderRadiusStyle,
                    }}
                  >
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-12 w-12 items-center justify-center text-slate-500 transition hover:bg-slate-50 active:bg-slate-100"
                    >
                      <StoreIcon name="minus" theme={theme} className="h-5 w-5" />
                    </button>
                    <span
                      className="flex h-12 w-16 items-center justify-center border-x text-base font-bold"
                      style={{
                        borderColor: theme.border_color || '#e2e8f0',
                        color: theme.text_color,
                      }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(stockLimit, q + 1))}
                      disabled={quantity >= stockLimit}
                      className="flex h-12 w-12 items-center justify-center text-slate-500 transition hover:bg-slate-50 active:bg-slate-100 disabled:opacity-50 disabled:bg-slate-50"
                    >
                      <StoreIcon name="plus" theme={theme} className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Total</p>
                    <p className="text-lg font-black" style={{ color: theme.text_color }}>
                      {formatCurrency(activePrice * quantity)}
                    </p>
                  </div>
                </div>
              </div>
              )}
            </div>
          </div>

          {/* Sticky Add to Cart Bar */}
          <div
            className="absolute bottom-0 left-0 w-full border-t p-4 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-20"
            style={{
              borderColor: theme.border_color || '#e2e8f0',
              backgroundColor: theme.surface_color || '#ffffff',
            }}
          >
            <button
              onClick={handleAddToCart}
              disabled={addedFeedback || isOutOfStock}
              className={`flex w-full items-center justify-center gap-2 p-4 text-sm font-bold shadow-lg transition-all duration-300 ${buttonRadiusClass} ${
                addedFeedback ? 'scale-95' : 'hover:scale-[1.02] active:scale-95'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
              style={{
                ...btnStyle,
                ...(addedFeedback ? { backgroundColor: '#22c55e', color: '#fff', border: 'none' } : {}),
                ...(isOutOfStock ? { backgroundColor: '#e2e8f0', color: '#64748b', border: 'none', boxShadow: 'none' } : {}),
              }}
            >
              {isOutOfStock ? (
                'Out of Stock'
              ) : addedFeedback ? (
                <>
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                  Added to Cart!
                </>
              ) : (
                <>
                  <StoreIcon name="add" theme={theme} className="h-5 w-5" />
                  Add {quantity} to Cart — {formatCurrency(activePrice * quantity)}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

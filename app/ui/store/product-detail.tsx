'use client';

import { User, Product, StoreTheme } from '@/app/lib/definitions';
import { formatCurrency, getButtonStyles } from '@/app/lib/utils';
import { FONT_MAP } from '@/app/lib/template-presets';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShareIcon, ArrowLeftIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ProductDetailProps {
  vendor: User;
  product: Product;
  theme: StoreTheme;
}

export default function ProductDetail({ vendor, product, theme }: ProductDetailProps) {
  const [selectedImage, setSelectedImage] = useState(product.image_url);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const galleryImages = product.gallery_images
    ? JSON.parse(product.gallery_images)
    : [];
  const allImages = [product.image_url, ...galleryImages].filter(Boolean);

  const btn = getButtonStyles(theme);
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.name,
          text: product.description || `Check out ${product.name}`,
          url: productUrl,
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(productUrl);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareMenu(false);
    }, 2000);
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent(`Check out ${product.name}: ${productUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const shareToTwitter = () => {
    const text = encodeURIComponent(product.name);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(productUrl)}`, '_blank');
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`, '_blank');
  };

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: theme.background_color,
        color: theme.text_color,
        fontFamily: FONT_MAP[theme.font_family] || 'Inter, sans-serif',
      }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-sm"
        style={{
          backgroundColor: `${theme.surface_color}f0`,
          borderColor: theme.border_color,
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link
            href={`/s/${vendor.store_slug}`}
            className="flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ color: theme.primary_color }}
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Store
          </Link>
          <h1
            className="text-lg font-bold"
            style={{
              color: theme.heading_color || theme.text_color,
              fontFamily: FONT_MAP[theme.heading_font] || undefined,
            }}
          >
            {vendor.store_name || vendor.name}
          </h1>
        </div>
      </header>

      {/* Product Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div
              className="relative aspect-square overflow-hidden"
              style={{
                borderRadius:
                  theme.border_radius === 'sharp'
                    ? '0'
                    : theme.border_radius === 'pill'
                    ? '2rem'
                    : '1rem',
                backgroundColor: theme.surface_color,
              }}
            >
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-300">
                  <svg
                    className="h-24 w-24"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className="relative aspect-square overflow-hidden border-2 transition-all"
                    style={{
                      borderRadius:
                        theme.border_radius === 'sharp'
                          ? '0'
                          : theme.border_radius === 'pill'
                          ? '0.75rem'
                          : '0.5rem',
                      borderColor:
                        selectedImage === img
                          ? theme.primary_color
                          : theme.border_color,
                    }}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1
                className="text-3xl lg:text-4xl font-bold mb-2"
                style={{
                  color: theme.heading_color || theme.text_color,
                  fontFamily: FONT_MAP[theme.heading_font] || undefined,
                }}
              >
                {product.name}
              </h1>
              {product.category && (
                <p className="text-sm opacity-60">{product.category}</p>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span
                className="text-3xl font-bold"
                style={{ color: theme.primary_color }}
              >
                {formatCurrency(product.price)}
              </span>
              {product.compare_at_price && product.compare_at_price > product.price && (
                <span className="text-lg line-through opacity-50">
                  {formatCurrency(product.compare_at_price)}
                </span>
              )}
            </div>

            {/* Description */}
            {product.description && (
              <div
                className="prose prose-sm max-w-none"
                style={{ color: theme.text_color }}
              >
                <p className="leading-relaxed">{product.description}</p>
              </div>
            )}

            {/* Stock Status */}
            {product.stock_quantity !== null && (
              <div className="flex items-center gap-2">
                {product.stock_quantity > 0 ? (
                  <>
                    <CheckIcon
                      className="h-5 w-5"
                      style={{ color: theme.accent_color || '#10b981' }}
                    />
                    <span className="text-sm font-medium">
                      {product.stock_quantity} in stock
                    </span>
                  </>
                ) : (
                  <span className="text-sm font-medium text-red-500">
                    Out of stock
                  </span>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Link
                href={`/s/${vendor.store_slug}`}
                className={`flex-1 px-6 py-4 text-center font-bold ${btn.className}`}
                style={btn.style}
              >
                View in Store
              </Link>

              {/* Share Button */}
              <div className="relative">
                <button
                  onClick={handleShare}
                  className="px-4 py-4 border-2 transition-all hover:scale-105"
                  style={{
                    borderColor: theme.border_color,
                    borderRadius:
                      theme.button_radius === 'sharp'
                        ? '0'
                        : theme.button_radius === 'pill'
                        ? '9999px'
                        : '0.5rem',
                    color: theme.primary_color,
                  }}
                  title="Share product"
                >
                  <ShareIcon className="h-5 w-5" />
                </button>

                {/* Share Menu */}
                {showShareMenu && (
                  <div
                    className="absolute right-0 top-full mt-2 w-48 border shadow-lg z-10"
                    style={{
                      backgroundColor: theme.surface_color,
                      borderColor: theme.border_color,
                      borderRadius: '0.75rem',
                    }}
                  >
                    <div className="p-2 space-y-1">
                      <button
                        onClick={copyLink}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-slate-50"
                      >
                        {copied ? '✓ Copied!' : 'Copy Link'}
                      </button>
                      <button
                        onClick={shareToWhatsApp}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-slate-50"
                      >
                        Share on WhatsApp
                      </button>
                      <button
                        onClick={shareToTwitter}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-slate-50"
                      >
                        Share on Twitter
                      </button>
                      <button
                        onClick={shareToFacebook}
                        className="w-full text-left px-3 py-2 text-sm rounded-lg transition-colors hover:bg-slate-50"
                      >
                        Share on Facebook
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Vendor Info */}
            <div
              className="mt-8 p-4 border rounded-lg"
              style={{
                backgroundColor: `${theme.surface_color}80`,
                borderColor: theme.border_color,
              }}
            >
              <h3 className="text-sm font-semibold mb-2 opacity-60">
                Sold by
              </h3>
              <p className="font-bold">{vendor.store_name || vendor.name}</p>
              {vendor.whatsapp_number && (
                <a
                  href={`https://wa.me/${vendor.whatsapp_number.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm font-semibold transition-colors hover:opacity-70"
                  style={{ color: theme.primary_color }}
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.03L.789 23.66l4.77-1.456A11.926 11.926 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818c-2.17 0-4.206-.61-5.947-1.664l-.427-.253-2.828.863.84-2.736-.278-.442A9.776 9.776 0 012.182 12c0-5.418 4.4-9.818 9.818-9.818S21.818 6.582 21.818 12 17.418 21.818 12 21.818z" />
                  </svg>
                  Contact Seller
                </a>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

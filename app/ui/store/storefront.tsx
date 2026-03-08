'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ShoppingBagIcon, XMarkIcon, PlusIcon, MinusIcon, ArrowRightIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { User, Product, OrderItem } from '@/app/lib/definitions';
import { formatCurrency } from '@/app/lib/utils';
import { createOrder } from '@/app/lib/actions';

export default function Storefront({ vendor, products }: { vendor: User; products: Product[] }) {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<{ id: string; total: number } | null>(null);

  const activeProducts = products.filter((p) => p.status === 'active');
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
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
      const result = await createOrder(vendor.id, cart, cartTotal, formData);
      if (result?.success) {
        setPlacedOrder({ id: result.id, total: cartTotal });
        setCart([]);
      }
    } catch (err) {
      console.error(err);
      alert('Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (placedOrder) {
    // Enhanced WhatsApp message with detailed order breakdown
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
          Your order has been sent to <strong>{vendor.name}</strong>. 
          To speed up processing, you can notify them directly via WhatsApp.
        </p>
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

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Store Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-lg font-bold text-white uppercase">
              {vendor.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-tight">{vendor.name}</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold font-mono">
                ovend.app/s/{vendor.store_slug}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-500 transition-colors"
          >
            <ShoppingBagIcon className="h-6 w-6" />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-emerald-500 text-[10px] font-bold text-white flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8 pb-32">
        <div className="mb-8 overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl relative">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold tracking-tight">Welcome to our store</h2>
            <p className="mt-2 text-slate-300 text-sm max-w-[240px]">
              Browse our collection and order directly via WhatsApp.
            </p>
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-10 -mt-10 blur-2xl"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full mr-10 mb-10 blur-xl"></div>
        </div>

        <section id="item-list">
          <div className="mb-6 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Products</h3>
            <span className="text-xs text-slate-500 font-medium bg-white px-3 py-1 rounded-full border border-slate-100 italic">
              {activeProducts.length} items available
            </span>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {activeProducts.map((product) => (
              <div
                key={product.id}
                className="group flex flex-col overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="aspect-square relative flex items-center justify-center bg-slate-50 text-slate-200 overflow-hidden">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform group-hover:scale-110 duration-500"
                    />
                  ) : (
                    <ShoppingBagIcon className="h-16 w-16" />
                  )}
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h4 className="font-bold text-slate-900 leading-snug mb-1">{product.name}</h4>
                  <p className="text-xs text-slate-500 line-clamp-2 min-h-[2rem]">
                    {product.description}
                  </p>
                  <div className="mt-4 flex items-center justify-between pt-4 border-t border-slate-50">
                    <p className="text-lg font-bold text-emerald-600">
                      {formatCurrency(product.price)}
                    </p>
                    <button 
                      onClick={() => addToCart(product)}
                      className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                      <PlusIcon className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && !isCartOpen && (
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl p-4 z-10">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="flex w-full items-center justify-between rounded-3xl bg-emerald-600 p-4 font-bold text-white shadow-2xl transition hover:bg-emerald-500 active:scale-95"
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
                            <p className="text-sm font-semibold text-emerald-600">{formatCurrency(item.price)}</p>
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
                    <div className="flex items-center justify-between text-lg font-bold text-slate-900 mb-6">
                      <span>Total</span>
                      <span>{formatCurrency(cartTotal)}</span>
                    </div>
                    
                    {!isCheckingOut ? (
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 p-4 font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-95"
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
                          <label className="block text-sm font-bold text-slate-700 mb-1 italic">WhatsApp Number</label>
                          <input 
                            name="customer_phone" 
                            required 
                            type="tel"
                            className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-emerald-500 transition" 
                            placeholder="+234 801 234 5678"
                          />
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
                            className="flex-[2] rounded-2xl bg-emerald-600 p-4 font-bold text-white shadow-lg transition hover:bg-emerald-500 active:scale-95 disabled:opacity-50"
                           >
                            {isSubmitting ? 'Placing Order...' : 'Confirm Order'}
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
    </div>
  );
}

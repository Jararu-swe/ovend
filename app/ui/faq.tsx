'use client';

import { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import { FadeInUp, StaggerContainer, StaggerItem } from '@/app/ui/scroll-animations';

const faqs = [
  {
    question: "What is Vendle?",
    answer: "Vendle is an e-commerce platform built specifically for online vendors to turn their social media audience into loyal customers. It lets you create a beautiful online storefront, manage inventory, process payments, and track orders from a single mobile-friendly dashboard."
  },
  {
    question: "Do I need any skills to set up a store?",
    answer: "Not at all. You can set up your store in under 3 minutes using our intuitive theme editor. No coding or technical knowledge is required—just pick a theme, add your brand colors, and start selling."
  },
  {
    question: "How do I share my store with customers?",
    answer: "Once your store is ready, you'll receive a unique custom link (e.g., vendle.com.ng/s/your-store-name). You can easily copy and paste this link into your Instagram bio, WhatsApp status, or Twitter profile."
  },
  {
    question: "Can I offer discounts to my customers?",
    answer: "Yes! Vendle has a built-in discount system. You can create percentage-based or fixed-amount discount codes right from your dashboard to run sales and promotional campaigns."
  },
  {
    question: "How do shoppers find my products?",
    answer: "Along with sharing your direct store link on your social media platforms, your shop can also be featured on the Vendle Explore page, allowing new customers to discover your products and shop directly."
  },
  {
    question: "How do I track my orders?",
    answer: "You can track all your orders in real time from your Vendle dashboard. Each order is updated with its current status—pending, confirmed, shipped, or delivered—so you always know where things stand. You'll also receive instant notifications for new orders and status changes."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="bg-[#FDFBF7] py-24 px-6 md:px-12 border-t border-slate-200/60">
      <div className="mx-auto max-w-3xl">
        <FadeInUp>
          <div className="text-center mb-16">
            <h2 className={`${lusitana.className} text-3xl md:text-5xl font-bold text-slate-900 mb-4`}>
              Frequently Asked Questions
            </h2>
            <p className="text-slate-600">Everything you need to know about setting up and running your Vendle store.</p>
          </div>
        </FadeInUp>

        <StaggerContainer className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <StaggerItem key={index}>
                <div 
                  className={`rounded-2xl border transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg ${
                    isOpen ? 'border-emerald-500 bg-white shadow-md' : 'border-slate-200 bg-white/50 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    aria-expanded={isOpen}
                  >
                    <span className={`font-semibold transition-colors duration-300 ${isOpen ? 'text-emerald-700' : 'text-slate-800'}`}>
                      {faq.question}
                    </span>
                    <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${isOpen ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <ChevronDownIcon 
                        className={`h-4 w-4 transition-transform duration-300 ${isOpen ? '-rotate-180' : ''}`} 
                      />
                    </span>
                  </button>
                  <div 
                    className={`grid transition-all duration-300 ease-in-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-6 pt-2 text-slate-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}

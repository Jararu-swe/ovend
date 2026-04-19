'use client';

import React from 'react';
import * as HeroIconsOutline from '@heroicons/react/24/outline';
import * as HeroIconsSolid from '@heroicons/react/24/solid';
import { 
  ShoppingBag as LucideShoppingBag, 
  ShoppingCart as LucideShoppingCart, 
  ShoppingBasket as LucideShoppingBasket,
  User as LucideUser,
  Smile as LucideSmile,
  CircleUserRound as LucideCircleUser,
  Share as LucideShare,
  Search as LucideSearch,
  Menu as LucideMenu,
  X as LucideX
} from 'lucide-react';
import { StoreTheme } from '@/app/lib/definitions';

interface StoreIconProps extends React.SVGProps<SVGSVGElement> {
  name: 'cart' | 'user' | 'share' | 'menu' | 'close' | 'search';
  theme: StoreTheme;
}

export default function StoreIcon({ name, theme, ...props }: StoreIconProps) {
  const { icon_library, icon_fill, icon_weight, cart_icon, user_icon } = theme;

  // Determine standard Lucide stroke width based on weight selection
  const lucideStrokeWidth = icon_weight === 'light' ? 1 
    : icon_weight === 'bold' ? 2.5 
    : 1.5;

  const IconWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className={`store-icon-wrapper w-5 h-5 flex items-center justify-center`} {...props as any}>
      {children}
    </div>
  );

  if (icon_library === 'lucide') {
    // Lucide doesn't have native "solid" exports by default, we simulate by applying a fill if strict solid is requested,, 
    // or we just use their outline natively.
    const fillStyle = icon_fill === 'solid' ? 'currentColor' : 'none';

    switch (name) {
      case 'cart':
        return <IconWrapper>
          {cart_icon === 'shopping-cart' ? <LucideShoppingCart strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : cart_icon === 'basket' ? <LucideShoppingBasket strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          // Tote and bag map to ShoppingBag in lucide conventionally
          : <LucideShoppingBag strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />}
        </IconWrapper>;
      case 'user':
        return <IconWrapper>
          {user_icon === 'face' ? <LucideCircleUser strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : user_icon === 'smile' ? <LucideSmile strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : <LucideUser strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />}
        </IconWrapper>;
      case 'share': return <IconWrapper><LucideShare strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'search': return <IconWrapper><LucideSearch strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'menu': return <IconWrapper><LucideMenu strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'close': return <IconWrapper><LucideX strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
    }
  }

  // Fallback / Default: Heroicons
  const IconSet = icon_fill === 'solid' ? HeroIconsSolid : HeroIconsOutline;
  
  // Heroicons doesn't support varying stroke width on SVG easily without overriding CSS, 
  // but we can apply custom stroke width classes if outline.
  const heroStrokeClass = icon_fill === 'outline' && icon_weight === 'light' ? 'stroke-1' 
    : icon_fill === 'outline' && icon_weight === 'bold' ? 'stroke-2' 
    : 'stroke-[1.5]';

  switch (name) {
    case 'cart': {
      const CartIcon = cart_icon === 'shopping-cart' ? IconSet.ShoppingCartIcon 
        : IconSet.ShoppingBagIcon; // Basket & tote fall back to bag
      return <CartIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    }
    case 'user': {
      const UserIcon = user_icon === 'face' ? IconSet.FaceSmileIcon : IconSet.UserIcon;
      return <UserIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    }
    case 'share': return <IconSet.ShareIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'search': return <IconSet.MagnifyingGlassIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'menu': return <IconSet.Bars3Icon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'close': return <IconSet.XMarkIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
  }

  return null;
}

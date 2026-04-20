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
  Share2 as LucideShare2,
  Send as LucideSend,
  Forward as LucideForward,
  MoreHorizontal as LucideMoreHorizontal,
  Plus as LucidePlus,
  Minus as LucideMinus,
  ChevronRight as LucideChevronRight,
  ArrowRight as LucideArrowRight,
  Search as LucideSearch,
  Menu as LucideMenu,
  X as LucideX
} from 'lucide-react';
import { StoreTheme } from '@/app/lib/definitions';

interface StoreIconProps extends React.SVGProps<SVGSVGElement> {
  name: 'cart' | 'user' | 'share' | 'menu' | 'close' | 'search' | 'add' | 'plus' | 'minus' | 'chevron-right';
  theme: StoreTheme;
}

export default function StoreIcon({ name, theme, ...props }: StoreIconProps) {
  const { icon_library, icon_fill, icon_weight, cart_icon, user_icon, share_icon, add_icon } = theme;

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
      case 'share':
        return <IconWrapper>
          {share_icon === 'paper-plane' ? <LucideSend strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : share_icon === 'arrow-curve' ? <LucideForward strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : share_icon === 'dots' ? <LucideMoreHorizontal strokeWidth={lucideStrokeWidth} className="w-full h-full" />
          : share_icon === 'nodes' ? <LucideShare2 strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : <LucideShare strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />}
        </IconWrapper>;
      case 'add':
        return <IconWrapper>
          {add_icon === 'bag' ? <LucideShoppingBag strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : add_icon === 'cart' ? <LucideShoppingCart strokeWidth={lucideStrokeWidth} fill={fillStyle} className="w-full h-full" />
          : add_icon === 'arrow' ? <LucideArrowRight strokeWidth={lucideStrokeWidth} className="w-full h-full" />
          : <LucidePlus strokeWidth={lucideStrokeWidth} className="w-full h-full" />}
        </IconWrapper>;
      case 'search': return <IconWrapper><LucideSearch strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'menu': return <IconWrapper><LucideMenu strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'close': return <IconWrapper><LucideX strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'plus': return <IconWrapper><LucidePlus strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'minus': return <IconWrapper><LucideMinus strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
      case 'chevron-right': return <IconWrapper><LucideChevronRight strokeWidth={lucideStrokeWidth} className="w-full h-full" /></IconWrapper>;
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
    case 'share': {
      const ShareIconComponent = share_icon === 'paper-plane' ? IconSet.PaperAirplaneIcon
        : share_icon === 'arrow-curve' ? IconSet.ArrowUturnRightIcon
        : share_icon === 'dots' ? IconSet.EllipsisHorizontalIcon
        : share_icon === 'nodes' ? IconSet.ShareIcon
        : IconSet.ArrowUpOnSquareIcon;
      return <ShareIconComponent className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    }
    case 'add': {
      const AddIconComponent = add_icon === 'bag' ? IconSet.ShoppingBagIcon
        : add_icon === 'cart' ? IconSet.ShoppingCartIcon
        : add_icon === 'arrow' ? IconSet.ArrowRightIcon
        : IconSet.PlusIcon;
      return <AddIconComponent className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    }
    case 'search': return <IconSet.MagnifyingGlassIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'menu': return <IconSet.Bars3Icon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'close': return <IconSet.XMarkIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'plus': return <IconSet.PlusIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'minus': return <IconSet.MinusIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
    case 'chevron-right': return <IconSet.ChevronRightIcon className={`w-full h-full ${heroStrokeClass}`} {...props as any} />;
  }

  return null;
}

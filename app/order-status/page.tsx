import Link from 'next/link';
import VendleLogo from '@/app/ui/vendle-logo';
import { redirect } from 'next/navigation';

export default function OrderStatusPage() {
  // Redirect to profile page where users can see their orders
  redirect('/profile/orders');
}

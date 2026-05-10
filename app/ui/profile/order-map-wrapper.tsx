'use client';

import dynamic from 'next/dynamic';

const OrderMap = dynamic(() => import('@/app/ui/orders/order-map'), { ssr: false });

export default function ProfileOrderMap({ lat, lng }: { lat: number; lng: number }) {
  return <OrderMap lat={lat} lng={lng} />;
}

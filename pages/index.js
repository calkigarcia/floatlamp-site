'use client';

import dynamic from 'next/dynamic';

const FloatLampPage = dynamic(() => import('../components/FloatLampPage'), {
  ssr: false,
});

export default function Home() {
  return <FloatLampPage />;
}

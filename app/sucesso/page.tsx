import { Suspense } from 'react';
import SucessoComponent from '../../components/PaymentSuccess';

export default function SucessoPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SucessoComponent />
    </Suspense>
  );
}

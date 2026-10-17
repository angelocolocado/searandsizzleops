import api from '~/lib/axios';
import React, { useState, useEffect } from 'react';
import { echo } from '~/lib/echo';

export default function QRPhCheckout() {
  const [qrCodeUrl, setQrCodeUrl] = useState(null);
  const [intentId, setIntentId] = useState(null);
  const [isPaid, setIsPaid] = useState(false);
  const [loading, setLoading] = useState(false);

  // WebSocket Listener Setup
  useEffect(() => {
    if (!intentId) return;

    // Makikinig sa channel na nakapangalan sa payment_intent_id
    const channel = echo.channel(`payment.${intentId}`);

    channel.listen('.PaymentSuccessful', (event: any) => {
      console.log('Payment confirmed via WebSocket!', event);
      setIsPaid(true);
    });

    // Cleanup: I-un-subscribe kapag nag-unmount o nagbago ang intentId
    return () => {
      echo.leaveChannel(`payment.${intentId}`);
    };
  }, [intentId]);

  const handleGenerateQR = async () => {
    setLoading(true);
    try {
      const response = await api.post('/v1/checkout/paymongo', { amount: 250 });
      
      if (response.data.qr_code_url) {
        setQrCodeUrl(response.data.qr_code_url);
        // Kopyahin din ang payment_intent_id mula sa backend response
        setIntentId(response.data.payment_intent_id);
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
    } finally {
      setLoading(false);
    }
  };

  // Success UI
  if (isPaid) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#16a34a' }}>
        <h2>🎉 Bayad na!</h2>
        <p>Natanggap na namin ang payment mo sa QR Ph.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h2>PayMongo QR Ph Checkout</h2>

      {!qrCodeUrl ? (
        <button onClick={handleGenerateQR} disabled={loading}>
          {loading ? 'Generating QR Code...' : 'Pay ₱250 via QR Ph'}
        </button>
      ) : (
        <div>
          <h3>Scan using GCash, Maya, or any Bank App</h3>
          <img src={qrCodeUrl} alt="QR Ph Code" style={{ width: '250px', height: '250px' }} />
          <p>Valid for 30 minutes. Automatic na magse-success ang UI pagka-scan mo.</p>
        </div>
      )}
    </div>
  );
} 
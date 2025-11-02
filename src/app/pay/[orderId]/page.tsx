'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ConnectWallet, useAddress, useSigner, useSDK } from '@thirdweb-dev/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ethers } from 'ethers';

type PaymentDetails = {
  amount: string;
  currency: string;
  merchantOrderId: string;
  customerEmail: string;
  callbackUrl: string;
  paymentSessionId: string;
  merchantPayoutWalletAddress: string;
};

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const address = useAddress();
  const signer = useSigner();
  const sdk = useSDK();

  useEffect(() => {
    if (!orderId) return;

    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        // In a real application, you would fetch payment details from your backend
        // using the orderId. For this example, we'll use a placeholder.
        // This API call should ideally be a GET request to /api/payment-session/[orderId]
        // that returns the details needed for the payment.
        const response = await fetch(`/api/payment-session/${orderId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch payment details.');
        }
        const data: PaymentDetails = await response.json();
        setPaymentDetails(data);
      } catch (err: any) {
        setError(err.message);
        toast.error('Error', { description: err.message || 'Could not load payment details.' });
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetails();
  }, [orderId]);

  const handlePayment = async () => {
    if (!paymentDetails || !address || !signer || !sdk) {
      toast.error('Error', { description: 'Missing payment details, wallet connection, or SDK.' });
      return;
    }

    setIsProcessingPayment(true);
    try {
      // Mapping of stablecoin symbols to their contract addresses and decimals on Arbitrum One
      const stablecoinConfig: { [key: string]: { address: string; decimals: number } } = {
        USDC: { address: '0xaf88d065e77c8cC2239327C5D4Ac6ea7DEcED63B', decimals: 6 }, // USDC on Arbitrum One
        // Add other stablecoins as needed
      };

      const config = stablecoinConfig[paymentDetails.currency];
      if (!config) {
        throw new Error(`Unsupported currency: ${paymentDetails.currency}`);
      }

      const stablecoinContractAddress = config.address;
      const stablecoinDecimals = config.decimals;

      const stablecoinContract = await sdk.getContract(stablecoinContractAddress);
      const amountInWei = ethers.utils.parseUnits(paymentDetails.amount, stablecoinDecimals);

      // 1. Approve the payment gateway to spend USDC
      // In a real scenario, you'd have a payment gateway contract address to approve
      // For now, we'll approve a dummy address or the merchant's address if it's a direct transfer
      const merchantWalletAddress = paymentDetails.merchantPayoutWalletAddress;
      const approvalTx = await stablecoinContract.call('approve', [merchantWalletAddress, amountInWei]);
      await approvalTx.wait();
      toast.success('Approval', { description: 'Token approval successful.' });

      // 2. Transfer stablecoin to the merchant or payment gateway
      const transferTx = await stablecoinContract.call('transfer', [merchantWalletAddress, amountInWei]);
      await transferTx.wait();
      toast.success('Payment', { description: `${paymentDetails.currency} payment successful!` });

      // 3. Notify backend of successful payment
      const webhookResponse = await fetch('/api/webhook/payment-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: paymentDetails.merchantOrderId,
          txHash: transferTx.receipt.transactionHash,
          status: 'confirmed',
          amount: paymentDetails.amount,
          stablecoinUsed: paymentDetails.currency,
          paymentSessionId: paymentDetails.paymentSessionId,
        }),
      });

      if (!webhookResponse.ok) {
        throw new Error('Failed to notify backend of payment status.');
      }

      toast.success('Success', { description: 'Payment confirmed with backend.' });

      // Redirect back to merchant's callback URL
      router.push(paymentDetails.callbackUrl);

    } catch (err: any) {
      setError(err.message);
      toast.error('Payment Error', { description: err.message || 'Payment failed.' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading payment details...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!paymentDetails) {
    return <div className="flex justify-center items-center h-screen">Payment details not found.</div>;
  }

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Complete Your Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-semibold">{paymentDetails.amount} {paymentDetails.currency}</span>
          </div>
          <div className="flex justify-between">
            <span>Merchant Order ID:</span>
            <span>{paymentDetails.merchantOrderId}</span>
          </div>
          <div className="flex justify-between">
            <span>Customer Email:</span>
            <span>{paymentDetails.customerEmail}</span>
          </div>

          <div className="border-t pt-4 space-y-4">
            <h3 className="text-lg font-semibold">Connect Your Wallet</h3>
            <ConnectWallet theme="light" btnTitle="Connect Wallet" />
            {address && (
              <p className="text-sm text-muted-foreground">Connected: {address}</p>
            )}
          </div>

          <Button
            onClick={handlePayment}
            disabled={!address || isProcessingPayment}
            className="w-full"
          >
            {isProcessingPayment ? 'Processing Payment...' : `Pay ${paymentDetails.amount} ${paymentDetails.currency}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

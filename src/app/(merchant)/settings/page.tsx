'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner'; // Changed import
import { ConnectButton } from 'thirdweb/react';
import { useAddress, useSigner } from '@thirdweb-dev/react';
import { CheckCircleIcon, XCircleIcon } from 'lucide-react';
import Spinner from '@/components/ui/spinner';
import { client } from '@/lib/thirdwebClient'; // Import the client from lib/thirdwebClient.ts
import { inAppWallet, createWallet } from 'thirdweb/wallets';
import { arbitrum } from "thirdweb/chains";

const wallets = [
  inAppWallet(),
  createWallet("io.metamask"),
  createWallet("com.coinbase.wallet"),
  createWallet("walletConnect"),
];

// Schema for form validation, matching the API's validation
const profileFormSchema = z.object({
  payout_wallet_address: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid wallet address format').optional().or(z.literal('')),
  webhook_url: z.string().url('Invalid URL').refine(s => s.startsWith('https'), 'Webhook URL must use HTTPS').optional().or(z.literal('')),
  is_payout_wallet_verified: z.boolean().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function SettingsPage() {
  // Removed: const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);

  const connectedAddress = useAddress(); // Get connected wallet address from Thirdweb
  const signer = useSigner(); // Get signer for message signing

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      payout_wallet_address: '',
      webhook_url: '',
      is_payout_wallet_verified: false,
    },
  });

  // Effect to fetch profile data and populate form
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/merchant/profile');
        if (!response.ok) throw new Error('Failed to fetch profile.');
        const data = await response.json();
        form.reset(data); // Populate form with fetched data
      } catch (error) {
        toast.error('Error', { description: 'Could not load profile data.' }); // Updated toast
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [form]); // Removed toast from dependency array as it's no longer a hook

  // Effect to update payout_wallet_address when a new wallet is connected
  useEffect(() => {
    if (connectedAddress && connectedAddress !== form.getValues('payout_wallet_address')) {
      form.setValue('payout_wallet_address', connectedAddress);
      form.setValue('is_payout_wallet_verified', false); // Reset verification status if address changes
    }
  }, [connectedAddress, form]);

  async function onSubmit(data: ProfileFormValues) {
    try {
      const response = await fetch('/api/merchant/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          payout_wallet_address: data.payout_wallet_address,
          webhook_url: data.webhook_url,
        }),
      });

      if (!response.ok) throw new Error('Failed to update profile.');

      toast.success('Success', { description: 'Your profile has been updated.' }); // Updated toast
    } catch (error) {
      toast.error('Error', { description: 'Could not update profile.' }); // Updated toast
    }
  }

  const handleVerifyWallet = async () => {
    if (!signer || !connectedAddress) {
      toast.error('Error', { description: 'No wallet connected or signer unavailable.' }); // Updated toast
      return;
    }
    if (connectedAddress.toLowerCase() !== form.getValues('payout_wallet_address')?.toLowerCase()) {
      toast.error('Error', { description: 'Connected wallet address does not match the one in the form.' }); // Updated toast
      return;
    }

    setIsVerifying(true);
    try {
      const originalMessage = "Verify ownership of this address for FlowKora";
      const signedMessage = await signer.signMessage(originalMessage);

      const response = await fetch('/api/merchant/verify-payout-wallet', {
        method: 'POST',
        headers: { 'Content-Type': 'application' },
        body: JSON.stringify({
          walletAddress: connectedAddress,
          signedMessage,
          originalMessage,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to verify wallet ownership.');
      }

      form.setValue('is_payout_wallet_verified', true);
      toast.success('Success', { description: 'Wallet ownership verified successfully!' }); // Updated toast
    } catch (error: any) {
      toast.error('Error', { description: error.message || 'Could not verify wallet ownership.' }); // Updated toast
    } finally {
      setIsVerifying(false);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  const currentPayoutAddress = form.watch('payout_wallet_address');
  const isVerified = form.watch('is_payout_wallet_verified');
  const canVerify = connectedAddress && currentPayoutAddress && connectedAddress.toLowerCase() === currentPayoutAddress.toLowerCase() && !isVerified;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Merchant Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="payout_wallet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payout Wallet Address</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input placeholder="0x..." {...field} readOnly={isVerified && connectedAddress?.toLowerCase() === field.value?.toLowerCase()} />
                      {isVerified && connectedAddress?.toLowerCase() === field.value?.toLowerCase() ? (
                        <CheckCircleIcon className="text-green-500 h-5 w-5" />
                      ) : (
                        field.value && <XCircleIcon className="text-red-500 h-5 w-5" />
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                  <div className="mt-2">
                    <ConnectButton theme="light" client={client} wallets={wallets} chain={arbitrum} />
                    {connectedAddress && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Connected: {connectedAddress}
                        {connectedAddress.toLowerCase() !== currentPayoutAddress?.toLowerCase() && currentPayoutAddress && (
                          <span className="text-orange-500 ml-2"> (Mismatch with saved address)</span>
                        )}
                      </p>
                    )}
                    {canVerify && (
                      <Button type="button" onClick={handleVerifyWallet} disabled={isVerifying} className="mt-2">
                        {isVerifying ? (<><Spinner size="small" /> Verifying...</>) : 'Verify Wallet Ownership'}
                      </Button>
                    )}
                    {isVerified && currentPayoutAddress && connectedAddress?.toLowerCase() === currentPayoutAddress?.toLowerCase() && (
                        <p className="text-sm text-green-500 mt-2 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-1" /> Wallet Verified
                        </p>
                    )}
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="webhook_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Webhook URL</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (<><Spinner size="small" /> Saving...</>) : 'Save Changes'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

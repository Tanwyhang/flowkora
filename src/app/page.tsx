'use client';

import { BackgroundBeams } from "@/components/ui/shadcn-io/background-beams";
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
// import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import { LayoutTextFlip } from '@/components/ui/layout-text-flip';
import { useEffect, useState } from 'react';
import Spinner from '@/components/ui/spinner';

/*
const testimonials = [
  {
    quote:
      "Stablecoins offer a new paradigm for financial stability, bridging traditional finance with the efficiency of blockchain. They are essential for a resilient global economy.",
    name: "Senator Blockchain",
    title: "Advocate for Digital Currencies",
  },
  {
    quote:
      "The future of commerce is digital, and stablecoins provide the trusted, programmable money necessary for this evolution. We must embrace this innovation responsibly.",
    name: "Representative Crypto",
    title: "Chair of the Fintech Committee",
  },
  {
    quote: "By offering a secure and transparent medium of exchange, stablecoins empower individuals and businesses, fostering economic inclusion and growth worldwide.",
    name: "Economist Satoshi",
    title: "Digital Finance Strategist",
  },
  {
    quote:
      "Regulatory clarity for stablecoins is not just about compliance; it's about unlocking their full potential to modernize payment systems and enhance financial accessibility for all.",
    name: "Secretary of Treasury",
    title: "Global Economic Leader",
  },
  {
    quote:
      "Stablecoins represent a significant leap forward in financial technology, promising lower transaction costs, faster settlements, and greater financial freedom for millions.",
    name: "Presidential Advisor",
    title: "Innovation Policy Expert",
  },
];
*/

export default function LandingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMerchantLoading, setIsMerchantLoading] = useState(false);
  const [isUserLoading, setIsUserLoading] = useState(false);

  return (
    
    <div className="relative mx-auto flex w-full flex-col items-center justify-center overflow-hidden bg-white p-4" style={{ height: '100vh' }}>
      {/* <BackgroundBeams className="absolute inset-0" /> */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center space-y-6 px-8 py-16 text-center">
        <div className="px-4 py-10 md:py-20">
          <h1 className="relative z-10 mx-auto max-w-4xl text-center text-2xl font-bold text-slate-700 md:text-4xl lg:text-7xl dark:text-slate-300">
            <LayoutTextFlip
              text="Welcome to "
              words={["FlowKora", "Stability", "The Future", "Innovation"]}
            />
          </h1>
          <motion.p
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 0.8,
            }}
            className="relative z-10 mx-auto max-w-xl py-4 text-center text-lg font-normal text-neutral-600 dark:text-neutral-400"
          >
            Choose your path to experience seamless stablecoin transactions.
          </motion.p>
          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              duration: 0.3,
              delay: 1,
            }}
            className="relative z-10 mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <Button
              onClick={() => {
                setIsMerchantLoading(true);
                router.push('/login');
              }}
              disabled={isMerchantLoading}
              className="w-60 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              {isMerchantLoading ? (
                <><Spinner size="small" /> Loading...</>
              ) : (
                "I'm a Merchant"
              )}
            </Button>
            <Button
              onClick={() => {
                setIsUserLoading(true);
                router.push('/user-portal');
              }}
              disabled={isUserLoading}
              variant="outline"
              className="w-60 transform rounded-lg border border-gray-300 bg-white px-6 py-2 font-medium text-black transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-100 dark:border-gray-700 dark:bg-black dark:text-white dark:hover:bg-gray-900"
            >
              {isUserLoading ? (
                <><Spinner size="small" /> Loading...</>
              ) : (
                "I'm a User"
              )}
            </Button>
          </motion.div>
        </div>
        {/* <div className="relative z-10 flex h-[20rem] flex-col items-center justify-center overflow-hidden rounded-md antialiased">
          <InfiniteMovingCards  
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div> */}
      </div>
    </div>
  );
}

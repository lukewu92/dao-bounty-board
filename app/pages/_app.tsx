import { createDefaultAuthorizationResultCache, SolanaMobileWalletAdapter } from '@solana-mobile/wallet-adapter-mobile';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import {
  GlowWalletAdapter,
  PhantomWalletAdapter,
  SlopeWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'next-themes';
import { useMemo } from 'react';

import { Background } from '../components/Background';
import { Footer } from '../components/Footer';
import { Header } from '../components/Header';
import { Main } from '../components/Main';
import { queryClient } from '../queryClient';

import type { AppProps } from 'next/app'
import type { FC } from 'react'
// Use require instead of import since order matters
require('@solana/wallet-adapter-react-ui/styles.css')
require('../styles/globals.css')

const App: FC<AppProps> = ({ Component, pageProps }) => {
  // Can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Devnet

  // You can also provide a custom RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading --
  // Only the wallets you configure here will be compiled into your application, and only the dependencies
  // of wallets that your users connect to will be loaded
  const wallets = useMemo(
    () => [
      new SolanaMobileWalletAdapter({
        appIdentity: { name: 'Solana Next.js Starter App' },
        authorizationResultCache: createDefaultAuthorizationResultCache(),
        cluster: 'mainnet-beta',
      }),
      new PhantomWalletAdapter(),
      new GlowWalletAdapter(),
      new SlopeWalletAdapter(),
      new SolflareWalletAdapter({ network }),
      new TorusWalletAdapter(),
    ],
    [network],
  )

  return (
    <ThemeProvider attribute="class">
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletModalProvider>
              <Background />
              <Header />
              <Main>
                <Component {...pageProps} />
              </Main>
              <Footer />
            </WalletModalProvider>
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App

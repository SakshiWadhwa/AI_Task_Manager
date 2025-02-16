// pages/_app.tsx
import React from 'react';
import Layout from '../components/Layout';
import '../styles/global.css'; // Your global styles (if any)

function MyApp({ Component, pageProps }: { Component: React.FC; pageProps: any }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;

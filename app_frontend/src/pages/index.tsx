import Head from 'next/head';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Head>
        <title>Home Page</title>
      </Head>
      <h1 className="text-3xl font-bold">Welcome to Task Manager</h1>
    </div>
  );
}
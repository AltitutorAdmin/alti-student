import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Home Page</title>
      </Head>

      <div className="text-center mt-8">
        <h2 className="text-xl">
          Get started by editing{' '}
          <code className="bg-gray-100 p-1">pages/index.js</code>
        </h2>
      </div>
    </>
  )
}
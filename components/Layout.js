import Header from './Header'
import Footer from './Footer'

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Fixed Header */}
      <Header title="My App" />

      {/* Main content has top padding so it isn't hidden behind the header */}
      <main className="flex-grow pt-16">
        {children}
      </main>

      {/* Footer at the bottom */}
      <Footer />
    </div>
  )
}

export default function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-100 py-6 w-full border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <p className="text-gray-600 text-sm font-medium">Altitutor Student Portal</p>
        </div>
        
        <div className="flex items-center space-x-6 text-sm">
          <a href="/privacy" className="text-gray-600 hover:text-blue-700 transition-colors">Privacy</a>
          <a href="/terms" className="text-gray-600 hover:text-blue-700 transition-colors">Terms</a>
          <a href="/contact" className="text-gray-600 hover:text-blue-700 transition-colors">Contact</a>
        </div>
        
        <div className="mt-4 md:mt-0 text-gray-500 text-xs">
          &copy; {currentYear} Altitutor. All rights reserved.
        </div>
      </div>
    </footer>
  )
}

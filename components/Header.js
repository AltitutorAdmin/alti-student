export default function Header({ title }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 z-50 shadow-md">
      {/* If you want true full-width edge-to-edge, remove 'max-w-7xl mx-auto' */}
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <nav>
          <ul className="flex space-x-4">
            <li><a href="#" className="hover:text-gray-400">Home</a></li>
            <li><a href="#" className="hover:text-gray-400">About</a></li>
            <li><a href="#" className="hover:text-gray-400">Contact</a></li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
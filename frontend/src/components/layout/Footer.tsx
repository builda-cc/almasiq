import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">QG Exchange</h3>
            <p className="text-slate-400 text-sm">
              AI-powered asset exchange marketplace for Kazakhstan and Central
              Asia. Exchange assets without selling them first.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/assets" className="hover:text-white transition-colors">
                  Browse Assets
                </Link>
              </li>
              <li>
                <Link to="/matches" className="hover:text-white transition-colors">
                  AI Matching
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/assets?category=apartments" className="hover:text-white transition-colors">
                  Apartments
                </Link>
              </li>
              <li>
                <Link to="/assets?category=houses" className="hover:text-white transition-colors">
                  Houses
                </Link>
              </li>
              <li>
                <Link to="/assets?category=land" className="hover:text-white transition-colors">
                  Land
                </Link>
              </li>
              <li>
                <Link to="/assets?category=vehicles" className="hover:text-white transition-colors">
                  Vehicles
                </Link>
              </li>
              <li>
                <Link to="/assets?category=commercial" className="hover:text-white transition-colors">
                  Commercial
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><span className="hover:text-white transition-colors">About</span></li>
              <li><span className="hover:text-white transition-colors">Terms</span></li>
              <li><span className="hover:text-white transition-colors">Privacy</span></li>
              <li><span className="hover:text-white transition-colors">Contact</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm text-slate-400">
          <p>© 2026 QG Exchange. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

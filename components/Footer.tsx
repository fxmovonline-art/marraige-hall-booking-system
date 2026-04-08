"use client";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gradient-to-tr from-[#013220] via-[#014421] to-[#026440] text-white pt-12 pb-6 px-4 mt-12 border-t border-green-900/40">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Brand & Description - Updated with bigger logo on left */}
        <div>
          <div className="flex items-center gap-4 mb-4">
            <img 
              src="/images/logo.png" 
              alt="La Grandeur" 
              className="w-20 h-20 rounded-full shadow-lg" 
            />
            {/* Agar "La Grandeur" text bhi chahiye to yahan add kar sakte hain */}
          </div>
          
          <p className="text-zinc-300 text-sm leading-relaxed">
            Your trusted partner for seamless, memorable, and elegant wedding events. 
            Book verified venues, explore premium services, and celebrate with confidence.
          </p>

          <div className="flex gap-4 mt-6">
            <a href="#" aria-label="Facebook" className="hover:text-yellow-300 transition-colors">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/>
              </svg>
            </a>
            
            <a href="#" aria-label="Instagram" className="hover:text-yellow-300 transition-colors">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.011 3.584-.069 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.011-4.85-.069c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608C4.515 2.497 5.782 2.225 7.148 2.163 8.414 2.105 8.794 2.163 12 2.163zm0-2.163C8.741 0 8.332.012 7.052.07 5.771.128 4.659.334 3.678 1.315c-.98.98-1.187 2.092-1.245 3.373C2.012 5.668 2 6.077 2 12c0 5.923.012 6.332.07 7.612.058 1.281.265 2.393 1.245 3.373.98.98 2.092 1.187 3.373 1.245C8.332 23.988 8.741 24 12 24s3.668-.012 4.948-.07c1.281-.058 2.393-.265 3.373-1.245.98-.98 1.187-2.092 1.245-3.373.058-1.28.07-1.689.07-7.612 0-5.923-.012-6.332-.07-7.612-.058-1.281-.265-2.393-1.245-3.373-.98-.98-2.092-1.187-3.373-1.245C15.668.012 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
              </svg>
            </a>
            
            <a href="#" aria-label="Twitter" className="hover:text-yellow-300 transition-colors">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 4.557a9.93 9.93 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.92 4.92 0 0 0-8.384 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.057 0 14.009-7.496 14.009-13.986 0-.213-.005-.425-.014-.636A9.936 9.936 0 0 0 24 4.557z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
          <ul className="space-y-2 text-zinc-300 text-sm">
            <li><Link href="/" className="hover:text-yellow-300 transition-colors">Home</Link></li>
            <li><Link href="/halls" className="hover:text-yellow-300 transition-colors">Browse Halls</Link></li>
            <li><Link href="/dashboard/owner" className="hover:text-yellow-300 transition-colors">Owner Dashboard</Link></li>
            <li><Link href="/dashboard/admin" className="hover:text-yellow-300 transition-colors">Admin Dashboard</Link></li>
            <li><Link href="/unauthorized" className="hover:text-yellow-300 transition-colors">Unauthorized</Link></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
          <ul className="space-y-2 text-zinc-300 text-sm">
            <li>
              Email: <a href="mailto:support@marraigehall.com" className="hover:text-yellow-300">support@marraigehall.com</a>
            </li>
            <li>
              Phone: <a href="tel:+1234567890" className="hover:text-yellow-300">+1 234 567 890</a>
            </li>
            <li>Location: 123 Celebration Ave, City, Country</li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h3 className="text-lg font-semibold mb-3">Newsletter</h3>
          <p className="text-zinc-300 text-sm mb-3">Get the latest updates and offers.</p>
          <form className="flex flex-col gap-2">
            <input 
              type="email" 
              placeholder="Your email address" 
              className="rounded px-4 py-2.5 text-zinc-900 focus:outline-none focus:ring-2 focus:ring-yellow-300" 
            />
            <button 
              type="submit" 
              className="bg-yellow-400 hover:bg-yellow-500 text-green-900 font-semibold rounded px-4 py-2.5 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>

      </div>

      {/* Bottom Copyright */}
      <div className="mt-12 border-t border-green-900/40 pt-6 text-center text-zinc-400 text-xs">
        &copy; {new Date().getFullYear()} Marriage Hall Booking. All rights reserved.
      </div>
    </footer>
  );
}
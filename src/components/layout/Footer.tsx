import { Link } from "react-router-dom";
import { Facebook, Instagram, Linkedin, Twitter } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#0f172a] text-white py-16 px-4 md:px-12 lg:px-24">
      {/* Top Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center text-center lg:text-left gap-10 lg:gap-0 mb-12">
        
        {/* Left: Join Our Community */}
        <div className="max-w-md">
          <h3 className="text-xl font-semibold mb-3 tracking-wide">Join Our Community</h3>
          <p className="text-gray-300 text-sm leading-relaxed">
            Connect with others on a shared path of growth, healing, and support. You're not alone—we're in this together.
          </p>
        </div>

        {/* Center: Logo */}
        <div className="flex items-center gap-2">
           <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center">
                <span className="font-serif text-2xl">3</span>
           </div>
           <span className="font-serif text-3xl italic">The 3 Tree</span>
        </div>

        {/* Right: Follow Along */}
        <div className="max-w-md text-center lg:text-right flex flex-col items-center lg:items-end">
          <h3 className="text-xl font-semibold mb-3 tracking-wide">Follow Along</h3>
          <p className="text-gray-300 text-sm leading-relaxed mb-4">
            Follow along for insights, inspiration, and gentle reminders to care for your mind and heart. Stay connected on the journey.
          </p>
          <div className="flex gap-4">
             <a href="#" className="bg-white text-[#0f172a] p-2 rounded-full hover:bg-gray-200 transition">
                <Facebook size={18} />
             </a>
             <a href="#" className="bg-white text-[#0f172a] p-2 rounded-full hover:bg-gray-200 transition">
                <Instagram size={18} />
             </a>
             <a href="#" className="bg-white text-[#0f172a] p-2 rounded-full hover:bg-gray-200 transition">
                <Linkedin size={18} />
             </a>
          </div>
        </div>

      </div>

      {/* Divider */}
      <hr className="border-gray-700 mb-12" />

      {/* Bottom Section: Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center md:text-left">
        
        {/* Column 1: PRODUCTS */}
        <div className="flex flex-col gap-4">
           <h4 className="font-bold tracking-widest text-sm mb-2">PRODUCTS</h4>
           <Link to="#" className="text-sm text-gray-300 hover:text-white transition">CUSTOMER CABINET</Link>
           <Link to="#" className="text-sm text-gray-300 hover:text-white transition">CHECKOUT</Link>
           <Link to="#" className="text-sm text-gray-300 hover:text-white transition">SHOP</Link>
           <Link to="#" className="text-sm text-gray-300 hover:text-white transition">CART</Link>
        </div>

        {/* Column 2: MAIN LINKS */}
        <div className="flex flex-col gap-4 items-center md:items-start">
           <h4 className="font-bold tracking-widest text-sm mb-2">MAIN LINKS</h4>
           <Link to="/" className="text-sm text-gray-300 hover:text-white transition">HOME</Link>
           <Link to="/about" className="text-sm text-gray-300 hover:text-white transition">ABOUT</Link>
           <Link to="/services" className="text-sm text-gray-300 hover:text-white transition">SERVICES</Link>
           <Link to="/resources" className="text-sm text-gray-300 hover:text-white transition">RESOURCES</Link>
           <Link to="/faqs" className="text-sm text-gray-300 hover:text-white transition">FAQS</Link>
        </div>

         {/* Column 3: SERVICES */}
         <div className="flex flex-col gap-4 items-center md:items-end">
           <h4 className="font-bold tracking-widest text-sm mb-2">SERVICES</h4>
           <Link to="/services" className="text-sm text-gray-300 hover:text-white transition">SERVICES</Link>
           <Link to="/team" className="text-sm text-gray-300 hover:text-white transition">THE TEAM</Link>
           <Link to="/resources" className="text-sm text-gray-300 hover:text-white transition">RESOURCES</Link>
           <Link to="/contact" className="text-sm text-gray-300 hover:text-white transition">BOOK AN APPOINTMENT</Link>
        </div>

      </div>
      
      {/* Optional Copyright (if needed below, though not in the screenshot explicitly, often standard) */}
      {/* <div className="text-center mt-12 text-gray-500 text-xs">
         &copy; {currentYear} The 3 Tree. All rights reserved.
      </div> */}

    </footer>
  );
}

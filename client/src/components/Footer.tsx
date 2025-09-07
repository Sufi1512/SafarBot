import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import logoImage from '../asset/images/logo.png';

interface FooterProps {
  disableCentering?: boolean;
}

const Footer: React.FC<FooterProps> = ({ disableCentering = false }) => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    services: [
      { name: 'Flight Booking', href: '/flights' },
      { name: 'Hotel Booking', href: '/hotels' },
      { name: 'Travel Insurance', href: '/insurance' },
      { name: 'Car Rental', href: '/cars' },
    ],
  };

  const socialLinks = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900">
      <div className={`${disableCentering ? 'w-full' : 'max-w-7xl mx-auto'} px-4 sm:px-6 lg:px-8 py-12`}>
        {/* Main Footer Content */}
        <div className="flex flex-col gap-8">
          {/* Top Row - Brand and Link Sections */}
          <div className="flex flex-col lg:flex-row lg:items-start gap-8 lg:gap-12">
            {/* Brand Section */}
            <div className="lg:flex-1">
              <div className="flex items-center mb-4">
                <img 
                  src={logoImage} 
                  alt="SafarBot Logo" 
                  className="w-10 h-10 object-contain mr-3"
                />
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">SafarBot</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI-Powered Travel Intelligence</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                AI-powered travel planning platform that makes booking flights and hotels effortless.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Mail className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">info@safarbot.com</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <Phone className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">+918127889889</span>
                </div>
                <div className="flex items-center text-gray-600 dark:text-gray-400">
                  <MapPin className="w-4 h-4 mr-3 flex-shrink-0" />
                  <span className="text-sm">India</span>
                </div>
              </div>
            </div>

            {/* Links Section - All aligned to start from top */}
            <div className="flex flex-col sm:flex-row gap-8 lg:gap-12">
              {/* Company Links */}
              <div className="flex flex-col">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  Company
                </h4>
                <ul className="space-y-3">
                  {footerLinks.company.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Support Links */}
              <div className="flex flex-col">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  Support
                </h4>
                <ul className="space-y-3">
                  {footerLinks.support.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Services Links */}
              <div className="flex flex-col">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 uppercase tracking-wide">
                  Services
                </h4>
                <ul className="space-y-3">
                  {footerLinks.services.map((link) => (
                    <li key={link.name}>
                      <Link
                        to={link.href}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-8 pt-8">
          <div className="flex flex-col sm:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 sm:mb-0">
              © {currentYear} SafarBot. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  aria-label={social.name}
                >
                  <span className="text-lg">{social.icon}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

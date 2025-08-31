import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plane, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';

const Footer: React.FC = () => {
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
    { name: 'Facebook', icon: Facebook, href: '#' },
    { name: 'Twitter', icon: Twitter, href: '#' },
    { name: 'Instagram', icon: Instagram, href: '#' },
    { name: 'LinkedIn', icon: Linkedin, href: '#' },
  ];

  return (
    <footer className="bg-white dark:bg-dark-card border-t border-secondary-200 dark:border-secondary-700">
      <div className="container-chisfis py-6 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center space-x-3 mb-4"
            >
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-medium">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-heading font-bold text-secondary-900 dark:text-dark-text">
                SafarBot
              </span>
            </motion.div>
            <p className="text-secondary-600 dark:text-secondary-300 mb-4 max-w-xs text-body">
              AI-powered travel planning platform that makes booking flights and hotels effortless.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center space-x-3 text-secondary-600 dark:text-secondary-300">
                <Mail className="w-4 h-4" />
                <span className="text-sm text-body">info@safarbot.com</span>
              </div>
              <div className="flex items-center space-x-3 text-secondary-600 dark:text-secondary-300">
                <Phone className="w-4 h-4" />
                <span className="text-sm text-body">+918127889889</span>
              </div>
              <div className="flex items-center space-x-3 text-secondary-600 dark:text-secondary-300">
                <MapPin className="w-4 h-4" />
                <span className="text-sm text-body">India</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-secondary-900 dark:text-dark-text mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 text-body"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-secondary-900 dark:text-dark-text mb-3">
              Support
            </h3>
            <ul className="space-y-2">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 text-body"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h3 className="text-lg font-heading font-semibold text-secondary-900 dark:text-dark-text mb-3">
              Services
            </h3>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-secondary-600 dark:text-secondary-300 hover:text-primary-500 dark:hover:text-primary-400 transition-colors duration-200 text-body"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-secondary-200 dark:border-secondary-700 mt-6 md:mt-10 pt-4 md:pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
            <p className="text-secondary-600 dark:text-secondary-300 text-sm text-body">
              © {currentYear} SafarBot. All rights reserved.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 bg-secondary-100 dark:bg-secondary-800 rounded-xl text-secondary-600 dark:text-secondary-300 hover:bg-primary-500 hover:text-white transition-all duration-200 focus-ring"
                >
                  <social.icon className="w-4 h-4" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

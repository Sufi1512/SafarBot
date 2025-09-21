import React from 'react';
import { Link } from 'react-router-dom';
import { TestTube } from 'lucide-react';
import UnifiedButton from './ui/UnifiedButton';

/**
 * Button Test Link Component
 * 
 * Quick access link to the button test page.
 * Add this to your ModernHeader or navigation for easy access during development.
 */
const ButtonTestLink: React.FC = () => {
  return (
    <Link to="/button-test">
      <UnifiedButton 
        variant="info" 
        size="sm" 
        icon={TestTube}
        className="text-xs"
      >
        Button Test
      </UnifiedButton>
    </Link>
  );
};

export default ButtonTestLink;

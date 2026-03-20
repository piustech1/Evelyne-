import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGlobe } from '@fortawesome/free-solid-svg-icons';
import { platformIcons } from '../utils/platformData';

interface PlatformIconProps {
  platform: string;
  className?: string;
  size?: 'xs' | 'sm' | 'lg' | 'xl' | '2xl' | '1x' | '2x' | '3x' | '4x' | '5x' | '6x' | '7x' | '8x' | '9x' | '10x';
  imgClassName?: string;
}

export const PlatformIcon = ({ platform, className, size, imgClassName }: PlatformIconProps) => {
  const pKey = platform.toLowerCase();
  const icon = platformIcons[pKey] || faGlobe;

  if (typeof icon === 'string') {
    return (
      <img 
        src={icon} 
        alt={platform} 
        className={imgClassName || "w-6 h-6 object-contain"} 
        referrerPolicy="no-referrer" 
      />
    );
  }

  return <FontAwesomeIcon icon={icon} className={className} size={size} />;
};

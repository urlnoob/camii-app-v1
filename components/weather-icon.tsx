import React from 'react'
import { Sun, Cloud, CloudRain, CloudLightning } from 'lucide-react'

interface WeatherIconProps {
  iconName: string;
}

export const WeatherIcon: React.FC<WeatherIconProps> = ({ iconName }) => {
  switch (iconName) {
    case 'Sun':
      return <Sun className="w-16 h-16 text-yellow-400" />;
    case 'Cloud':
      return <Cloud className="w-16 h-16 text-gray-400" />;
    case 'CloudRain':
      return <CloudRain className="w-16 h-16 text-blue-400" />;
    case 'CloudLightning':
      return <CloudLightning className="w-16 h-16 text-purple-400" />;
    default:
      return <Cloud className="w-16 h-16 text-gray-400" />;
  }
};


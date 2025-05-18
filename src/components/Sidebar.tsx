
import React from 'react';
import { PlayerView } from '@/lib/types';
import { Home, PlayCircle, List, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface SidebarProps {
  activeView: PlayerView;
  onChangeView: (view: PlayerView) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView }) => {
  const navigate = useNavigate();
  
  const navItems = [
    { 
      icon: Home, 
      label: 'Home', 
      active: activeView === 'nowPlaying',
      onClick: () => onChangeView('nowPlaying') 
    },
    { 
      icon: List, 
      label: 'Playlists',
      active: activeView === 'playlist', 
      onClick: () => onChangeView('playlist') 
    },
    { 
      icon: QrCode, 
      label: 'QR Codes',
      active: false,
      onClick: () => navigate('/qrcodes')
    }
  ];

  return (
    <div className="bg-white w-24 md:w-64 border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200 flex items-center justify-center md:justify-start">
        <PlayCircle className="h-8 w-8 text-player-blue" />
        <h1 className="text-xl font-medium ml-3 hidden md:block">Audio Player</h1>
      </div>
      <nav className="flex-1">
        <ul className="py-4 space-y-1">
          {navItems.map((item, index) => (
            <li key={index}>
              <button 
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center px-4 py-3 text-left",
                  "md:hover:bg-gray-100 transition-colors",
                  item.active ? "text-player-blue bg-gray-50" : "text-gray-500"
                )}
              >
                <item.icon className="h-5 w-5 mx-auto md:mx-0" />
                <span className="ml-3 hidden md:block">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;

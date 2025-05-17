
import React from "react";
import { cn } from "@/lib/utils";
import { Music, ListMusic, Disc } from "lucide-react";

interface SidebarProps {
  activeView: string;
  onChangeView: (view: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView }) => {
  const navItems = [
    { id: "nowPlaying", name: "Now Playing", icon: <Music className="w-5 h-5" /> },
    { id: "playlist", name: "Playlists", icon: <ListMusic className="w-5 h-5" /> },
    { id: "browse", name: "Browse", icon: <Disc className="w-5 h-5" /> },
  ];

  return (
    <div className="flex flex-col w-full md:w-64 h-24 md:h-full bg-white rounded-t-3xl md:rounded-tr-none md:rounded-l-3xl border-t md:border-t-0 md:border-r border-gray-100 overflow-hidden">
      <div className="p-4 md:p-6 flex flex-row md:flex-col gap-2 md:gap-6 items-center md:items-start">
        <div className="hidden md:flex flex-col space-y-1 mb-6">
          <h2 className="text-xl font-bold text-player-primary">Melody</h2>
          <p className="text-xs text-player-text">Music Player</p>
        </div>
        
        <nav className="flex flex-row md:flex-col gap-1 md:gap-2 w-full">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onChangeView(item.id)}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg transition-colors",
                activeView === item.id 
                  ? "bg-player-light text-player-primary" 
                  : "text-player-text hover:bg-gray-50"
              )}
            >
              {item.icon}
              <span className="hidden md:inline text-sm font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;


import React from 'react';
import { cn } from '@/lib/utils';
import { Music, Play, Pause } from 'lucide-react';
import { Playlist, Track, PlayerState } from '@/lib/types';
import { mockPlaylists } from '@/lib/data';
import AudioControls from './AudioControls';

interface PlaylistProps {
  playerState: PlayerState;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onSeek: (position: number) => void;
  onVolumeChange: (volume: number) => void;
  onToggleShuffle: () => void;
  onToggleRepeat: () => void;
  onSelectTrack: (track: Track, playlist: Playlist) => void;
}

const PlaylistView: React.FC<PlaylistProps> = ({
  playerState,
  onPlayPause,
  onNext,
  onPrevious,
  onSeek,
  onVolumeChange,
  onToggleShuffle,
  onToggleRepeat,
  onSelectTrack,
}) => {
  const { currentTrack, isPlaying, currentPlaylist } = playerState;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto">
      <h1 className="text-2xl font-bold mb-6">Your Playlists</h1>
      
      {mockPlaylists.map((playlist) => (
        <div key={playlist.id} className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-player-gray">
              {playlist.coverArt ? (
                <img src={playlist.coverArt} alt={playlist.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="text-player-text/50" size={24} />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold">{playlist.name}</h2>
              <p className="text-sm text-player-text">{playlist.tracks.length} tracks</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl overflow-hidden">
            {playlist.tracks.map((track) => {
              const isCurrentTrack = currentTrack?.id === track.id;
              
              return (
                <div 
                  key={track.id}
                  onClick={() => onSelectTrack(track, playlist)}
                  className={cn(
                    "playlist-item cursor-pointer group",
                    isCurrentTrack && "active"
                  )}
                >
                  <div className="w-10 h-10 rounded-md overflow-hidden bg-player-gray mr-3 flex-shrink-0">
                    <img src={track.albumArt} alt={track.album} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-grow min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="truncate">
                        <h3 className={cn(
                          "text-sm font-medium truncate",
                          isCurrentTrack ? "text-player-primary" : "text-gray-800"
                        )}>
                          {track.title}
                        </h3>
                        <p className="text-xs text-player-text truncate">{track.artist}</p>
                      </div>
                      <span className="text-xs text-player-text ml-2 flex-shrink-0">{formatTime(track.duration)}</span>
                    </div>
                  </div>
                  
                  {isCurrentTrack && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayPause();
                      }}
                      className="ml-2 p-2 rounded-full bg-player-primary text-white opacity-0 group-hover:opacity-100 md:flex-shrink-0"
                    >
                      {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {currentTrack && (
        <div className="sticky bottom-0 left-0 right-0 mt-auto pt-4 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
              <img src={currentTrack.albumArt} alt={currentTrack.album} className="w-full h-full object-cover" />
            </div>
            <div className="flex-grow min-w-0">
              <h3 className="text-sm font-medium truncate">{currentTrack.title}</h3>
              <p className="text-xs text-player-text truncate">{currentTrack.artist}</p>
            </div>
            <AudioControls
              playerState={playerState}
              onPlayPause={onPlayPause}
              onNext={onNext}
              onPrevious={onPrevious}
              onSeek={onSeek}
              onVolumeChange={onVolumeChange}
              onToggleShuffle={onToggleShuffle}
              onToggleRepeat={onToggleRepeat}
              minimal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistView;

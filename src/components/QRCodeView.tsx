
import React, { useState } from 'react';
import { Track } from '@/lib/types';
// Fix the import to use named export instead of default export
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

interface QRCodeViewProps {
  tracks: Track[];
  baseUrl: string;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ tracks, baseUrl }) => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);

  const generateQrUrl = (track: Track) => {
    return `${baseUrl}/track/${track.id}`;
  };

  const downloadQRCode = () => {
    if (!selectedTrack) return;

    const canvas = document.getElementById('qrcode-canvas') as HTMLCanvasElement;
    if (!canvas) return;

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = `qrcode-${selectedTrack.title.replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Track QR Codes</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Select a Track:</label>
        <select 
          className="w-full p-2 border border-gray-300 rounded-md"
          value={selectedTrack?.id || ''}
          onChange={(e) => {
            const track = tracks.find(t => t.id === e.target.value);
            setSelectedTrack(track || null);
          }}
        >
          <option value="">-- Select a track --</option>
          {tracks.map(track => (
            <option key={track.id} value={track.id}>
              {track.title}
            </option>
          ))}
        </select>
      </div>

      {selectedTrack && (
        <div className="flex flex-col items-center">
          <div className="mb-4">
            <p className="text-lg font-medium">{selectedTrack.title}</p>
            <p className="text-sm text-gray-600">{selectedTrack.artist}</p>
          </div>
          
          <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
            {/* Replace QRCode with QRCodeSVG and add id for download functionality */}
            <QRCodeSVG
              id="qrcode-canvas"
              value={generateQrUrl(selectedTrack)}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="text-center mb-4">
            <p className="text-xs break-all max-w-xs">{generateQrUrl(selectedTrack)}</p>
          </div>

          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={downloadQRCode}
          >
            <Download size={16} />
            Download QR Code
          </Button>
        </div>
      )}
    </div>
  );
};

export default QRCodeView;

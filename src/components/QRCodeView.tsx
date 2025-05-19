
import React, { useState, useRef } from 'react';
import { Track } from '@/lib/types';
// Fix the import to use named export instead of default export
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Download, ExternalLink, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface QRCodeViewProps {
  tracks: Track[];
  baseUrl: string;
}

const QRCodeView: React.FC<QRCodeViewProps> = ({ tracks, baseUrl }) => {
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
  const qrRef = useRef<SVGSVGElement>(null);
  const { toast } = useToast();

  const generateQrUrl = (track: Track) => {
    return `${baseUrl}/track/${track.id}`;
  };

  const downloadQRCode = () => {
    if (!selectedTrack || !qrRef.current) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const svg = qrRef.current;
    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    // Convert SVG to base64 string
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    
    img.onload = () => {
      // Set canvas dimensions to match the SVG
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Draw the image on the canvas
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      
      // Download the canvas as PNG
      const downloadLink = document.createElement('a');
      downloadLink.href = canvas.toDataURL('image/png');
      downloadLink.download = `qrcode-${selectedTrack.title.replace(/\s+/g, '-')}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "QR Code Downloaded",
        description: `QR code for "${selectedTrack.title}" has been saved to your device.`,
      });
    };
    
    img.src = url;
  };

  const copyLinkToClipboard = () => {
    if (!selectedTrack) return;
    
    const url = generateQrUrl(selectedTrack);
    navigator.clipboard.writeText(url).then(() => {
      toast({
        title: "Link Copied",
        description: "Direct link copied to clipboard.",
      });
    }).catch(err => {
      toast({
        title: "Failed to Copy",
        description: "Could not copy the link to clipboard.",
        variant: "destructive"
      });
    });
  };

  const openInNewTab = () => {
    if (!selectedTrack) return;
    window.open(generateQrUrl(selectedTrack), '_blank');
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
            <QRCodeSVG
              ref={qrRef}
              value={generateQrUrl(selectedTrack)}
              size={200}
              bgColor="#ffffff"
              fgColor="#000000"
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="text-center mb-6">
            <p className="text-xs break-all max-w-xs">{generateQrUrl(selectedTrack)}</p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2"
              onClick={downloadQRCode}
            >
              <Download size={16} />
              Download QR Code
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={copyLinkToClipboard}
            >
              <Copy size={16} />
              Copy Link
            </Button>
            
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={openInNewTab}
            >
              <ExternalLink size={16} />
              Test Link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QRCodeView;

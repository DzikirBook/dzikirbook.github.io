
import { useState, useEffect } from 'react';
import { fetchDzikirTracks } from '@/lib/supabase-client';
import { Track } from '@/lib/types';
import QRCodeView from '@/components/QRCodeView';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const QRCodesPage = () => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Get the base URL for the application
  const baseUrl = window.location.origin;

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setIsLoading(true);
        const data = await fetchDzikirTracks();
        if (data.length === 0) {
          toast({
            title: 'No tracks found',
            description: 'No audio tracks were found in the database.',
            variant: 'destructive',
          });
        } else {
          setTracks(data);
        }
      } catch (error) {
        console.error('Error fetching tracks:', error);
        toast({
          title: 'Error',
          description: 'Failed to load tracks. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTracks();
  }, [toast]);

  return (
    <div className="min-h-screen p-4 md:p-8" 
         style={{
           background: "linear-gradient(to bottom right, rgba(244, 189, 88, 0.3), white, rgba(119, 181, 225, 0.3))"
         }}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            className="mr-4"
            onClick={() => navigate('/')}
          >
            <ArrowLeft />
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">QR Code Generator</h1>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin w-8 h-8 border-4 border-[#77B5E1] rounded-full border-t-transparent"></div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <p className="mb-6 text-gray-600">
              Generate QR codes for each audio track. Users can scan these codes to access individual tracks directly.
            </p>
            
            {tracks.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-gray-500 mb-4">No audio tracks available.</p>
                <Button onClick={() => navigate('/')}>
                  Return to Player
                </Button>
              </div>
            ) : (
              <QRCodeView tracks={tracks} baseUrl={baseUrl} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default QRCodesPage;

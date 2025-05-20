
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.1"

// Create a Supabase client with the Auth context of the function
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper function to format track titles from filenames
const formatTitleFromFilename = (filename: string): string => {
  // Remove file extension and replace underscores/hyphens with spaces
  const nameOnly = filename.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
  
  // Capitalize each word
  return nameOnly.split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { record } = await req.json();
    console.log("Storage event received:", record);

    if (!record) {
      return new Response(JSON.stringify({ error: "No record provided" }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { name, bucket_id, id, metadata } = record;
    
    // Only process audio files (you might want to adjust this logic)
    const isAudioFile = name.toLowerCase().endsWith('.mp3') || 
                        name.toLowerCase().endsWith('.wav') || 
                        name.toLowerCase().endsWith('.ogg') ||
                        name.toLowerCase().endsWith('.m4a');

    if (!isAudioFile) {
      return new Response(JSON.stringify({ message: "Not an audio file, skipping" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if this file already exists in the dzikiraudio table
    const { data: existingRecord } = await supabase
      .from('dzikiraudio')
      .select('id')
      .eq('audiourl', `${supabaseUrl}/storage/v1/object/public/${bucket_id}/${name}`)
      .maybeSingle();

    if (existingRecord) {
      console.log("File already exists in database, skipping");
      return new Response(JSON.stringify({ message: "File already exists in database" }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Format nice title from filename
    const title = formatTitleFromFilename(name);

    // Prepare record to insert
    const audioRecord = {
      title: title,
      artist: 'Unknown Artist', // Default values
      album: 'Unknown Album',   // Default values
      audiourl: `${supabaseUrl}/storage/v1/object/public/${bucket_id}/${name}`,
      duration: 0,  // You might want to analyze the file to get actual duration
    };

    // Insert the new record into dzikiraudio table
    const { data, error } = await supabase
      .from('dzikiraudio')
      .insert(audioRecord)
      .select();

    if (error) {
      console.error("Error inserting record:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log("Successfully added new audio track to database:", data);
    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})

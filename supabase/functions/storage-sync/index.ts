
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

// Function to synchronize existing files from a bucket
const syncExistingFiles = async (bucketId: string) => {
  try {
    console.log(`Starting sync of existing files in bucket: ${bucketId}`);
    
    // List all files in the bucket
    const { data: files, error: listError } = await supabase
      .storage
      .from(bucketId)
      .list();
    
    if (listError) {
      console.error("Error listing files:", listError);
      return { error: listError.message };
    }
    
    console.log(`Found ${files?.length || 0} files in bucket`);
    
    const results = [];
    
    // Process each file
    for (const file of files || []) {
      // Skip folders
      if (file.id === null) continue;
      
      const name = file.name;
      
      // Only process audio files
      const isAudioFile = name.toLowerCase().endsWith('.mp3') || 
                          name.toLowerCase().endsWith('.wav') || 
                          name.toLowerCase().endsWith('.ogg') ||
                          name.toLowerCase().endsWith('.m4a');
      
      if (!isAudioFile) continue;
      
      // Check if this file already exists in the dzikiraudio table
      const { data: existingRecord } = await supabase
        .from('dzikiraudio')
        .select('id')
        .eq('audiourl', `${supabaseUrl}/storage/v1/object/public/${bucketId}/${name}`)
        .maybeSingle();
      
      if (existingRecord) {
        console.log(`File ${name} already exists in database, skipping`);
        continue;
      }
      
      // Format nice title from filename
      const title = formatTitleFromFilename(name);
      
      // Determine category from filename
      let artist = 'Unknown Artist';
      let album = 'Unknown Album';
      
      if (name.toLowerCase().includes('doa')) {
        artist = 'Daily Prayers';
        album = 'Islamic Prayers';
      } else if (name.toLowerCase().includes('dzikir') || name.toLowerCase().includes('tahmid') || name.toLowerCase().includes('istighfar')) {
        artist = 'Daily Dzikir';
        album = 'Islamic Recitations';
      } else if (name.toLowerCase().includes('quran') || name.toLowerCase().includes('ayat') || name.toLowerCase().includes('al-')) {
        artist = 'Quran Recitation';
        album = 'Islamic Audio Collection';
      }
      
      // Prepare record to insert
      const audioRecord = {
        title: title,
        artist: artist,
        album: album,
        audiourl: `${supabaseUrl}/storage/v1/object/public/${bucketId}/${name}`,
        duration: 0,
      };
      
      // Insert the new record into dzikiraudio table
      const { data, error } = await supabase
        .from('dzikiraudio')
        .insert(audioRecord)
        .select();
      
      if (error) {
        console.error(`Error inserting record for ${name}:`, error);
        results.push({ file: name, success: false, error: error.message });
      } else {
        console.log(`Successfully added ${name} to database:`, data);
        results.push({ file: name, success: true, data });
      }
    }
    
    return { success: true, results };
  } catch (error) {
    console.error("Error syncing existing files:", error);
    return { success: false, error: error.message };
  }
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Check if this is a manual sync request
    const url = new URL(req.url);
    if (url.searchParams.get('sync') === 'true') {
      const bucketId = url.searchParams.get('bucket') || 'audio';
      const result = await syncExistingFiles(bucketId);
      
      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    // Process regular webhook event
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
    
    // Determine category from filename
    let artist = 'Unknown Artist';
    let album = 'Unknown Album';
    
    if (name.toLowerCase().includes('doa')) {
      artist = 'Daily Prayers';
      album = 'Islamic Prayers';
    } else if (name.toLowerCase().includes('dzikir') || name.toLowerCase().includes('tahmid') || name.toLowerCase().includes('istighfar')) {
      artist = 'Daily Dzikir';
      album = 'Islamic Recitations';
    } else if (name.toLowerCase().includes('quran') || name.toLowerCase().includes('ayat') || name.toLowerCase().includes('al-')) {
      artist = 'Quran Recitation';
      album = 'Islamic Audio Collection';
    }

    // Prepare record to insert
    const audioRecord = {
      title: title,
      artist: artist,
      album: album,
      audiourl: `${supabaseUrl}/storage/v1/object/public/${bucket_id}/${name}`,
      duration: 0,
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

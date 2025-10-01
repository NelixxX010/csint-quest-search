import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.58.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SearchResult {
  file: string;
  type: string;
  line: number;
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      console.error('Profile error or not admin:', profileError);
      throw new Error('Admin access required');
    }

    // Get search query
    const url = new URL(req.url);
    const query = url.searchParams.get('query');
    
    if (!query || query.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Query parameter is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching for:', query);

    // Get all files from storage
    const { data: files, error: listError } = await supabaseClient
      .storage
      .from('searchable-files')
      .list();

    if (listError) {
      console.error('Error listing files:', listError);
      throw listError;
    }

    if (!files || files.length === 0) {
      console.log('No files found in storage');
      return new Response(
        JSON.stringify([]),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${files.length} files to search`);

    const results: SearchResult[] = [];
    const searchTerm = query.toLowerCase();

    // Search through each file
    for (const file of files) {
      if (!file.name) continue;

      try {
        // Download file content
        const { data: fileData, error: downloadError } = await supabaseClient
          .storage
          .from('searchable-files')
          .download(file.name);

        if (downloadError) {
          console.error(`Error downloading ${file.name}:`, downloadError);
          continue;
        }

        // Convert blob to text
        const text = await fileData.text();
        const lines = text.split('\n');

        // Determine file type
        const extension = file.name.split('.').pop()?.toLowerCase() || '';
        let fileType = 'txt';
        if (extension === 'sql') fileType = 'sql';
        else if (extension === 'db') fileType = 'db';

        // Search in each line
        lines.forEach((line, index) => {
          if (line.toLowerCase().includes(searchTerm)) {
            results.push({
              file: file.name,
              type: fileType,
              line: index + 1,
              content: line.trim()
            });
          }
        });

        console.log(`Searched ${file.name}: found ${results.length} matches so far`);
      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
      }
    }

    console.log(`Total results: ${results.length}`);

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in search-files function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
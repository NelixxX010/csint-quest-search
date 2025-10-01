import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Navigate } from 'react-router-dom';
import { Users, Search, TrendingUp, Eye, FileSearch, Upload, Trash2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  totalSearches: number;
  totalVisits: number;
  todayVisits: number;
  searchesData: Array<{ date: string; searches: number }>;
  visitsData: Array<{ date: string; visits: number }>;
  topSearches: Array<{ query: string; count: number }>;
}

interface FileSearchResult {
  file: string;
  type: string;
  line: number;
  content: string;
}

interface UploadedFile {
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

const Dashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const { toast } = useToast();

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);

      // Récupérer les totaux
      const [usersResult, searchesResult, visitsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('searches').select('*', { count: 'exact', head: true }),
        supabase.from('site_visits').select('*', { count: 'exact', head: true })
      ]);

      // Visites aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Données des 7 derniers jours
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const { data: searchesData } = await supabase
        .from('searches')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      const { data: visitsData } = await supabase
        .from('site_visits')
        .select('created_at')
        .gte('created_at', sevenDaysAgo.toISOString());

      // Top recherches
      const { data: topSearchesData } = await supabase
        .from('searches')
        .select('query')
        .limit(100);

      // Traitement des données
      const searchesByDay = processDataByDay(searchesData || [], "searches");
      const visitsByDay = processDataByDay(visitsData || [], "visits");
      const topSearchesProcessed = processTopSearches(topSearchesData || []);

      setStats({
        totalUsers: usersResult.count || 0,
        totalSearches: searchesResult.count || 0,
        totalVisits: visitsResult.count || 0,
        todayVisits: todayCount || 0,
        searchesData: searchesByDay,
        visitsData: visitsByDay,
        topSearches: topSearchesProcessed
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les statistiques",
        variant: "destructive"
      });
    } finally {
      setLoadingStats(false);
    }
  };

  const processDataByDay = (
    data: Array<{ created_at: string }>,
    type: "searches" | "visits"
  ) => {
    const dayMap = new Map<string, number>();

    data.forEach(item => {
      const dateKey = item.created_at.split("T")[0];
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([date, count]) => {
        const result: any = {
          date: new Date(date).toLocaleDateString("fr-FR"),
        };
        result[type] = count;
        return result;
      })
      .sort((a, b) =>
        new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime()
      )
      .slice(-7);
  };

  const processTopSearches = (data: Array<{ query: string }>) => {
    const queryMap = new Map<string, number>();

    data.forEach(item => {
      if (item.query) {
        queryMap.set(item.query, (queryMap.get(item.query) || 0) + 1);
      }
    });

    return Array.from(queryMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const loadUploadedFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('uploaded_files')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUploadedFiles(data || []);
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExtensions = ['.sql', '.db', '.txt'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Type de fichier invalide",
        description: "Seuls les fichiers .sql, .db et .txt sont acceptés",
        variant: "destructive"
      });
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10485760) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 10MB",
        variant: "destructive"
      });
      return;
    }

    setUploadingFile(true);
    try {
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('searchable-files')
        .upload(file.name, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .insert({
          filename: file.name,
          file_path: uploadData.path,
          file_type: fileExtension.replace('.', ''),
          file_size: file.size,
          uploaded_by: user?.id
        });

      if (dbError) throw dbError;

      toast({
        title: "Fichier téléchargé",
        description: `${file.name} a été téléchargé avec succès`,
      });

      loadUploadedFiles();
      
      // Reset input
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible de télécharger le fichier",
        variant: "destructive"
      });
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteFile = async (fileId: string, filename: string) => {
    try {
      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from('searchable-files')
        .remove([filename]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from('uploaded_files')
        .delete()
        .eq('id', fileId);

      if (dbError) throw dbError;

      toast({
        title: "Fichier supprimé",
        description: `${filename} a été supprimé`,
      });

      loadUploadedFiles();
    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Erreur de suppression",
        description: "Impossible de supprimer le fichier",
        variant: "destructive"
      });
    }
  };

  const handleFileSearch = async () => {
    if (!searchQuery.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez saisir un terme de recherche",
        variant: "destructive"
      });
      return;
    }

    setLoadingSearch(true);
    try {
      const { data, error } = await supabase.functions.invoke('search-files', {
        body: { query: searchQuery }
      });

      if (error) throw error;

      setSearchResults(data || []);
      
      toast({
        title: "Recherche terminée",
        description: `${data?.length || 0} résultat(s) trouvé(s)`,
      });
    } catch (error) {
      console.error('Search error:', error);
      toast({
        title: "Erreur de recherche",
        description: "Impossible d'effectuer la recherche",
        variant: "destructive"
      });
    } finally {
      setLoadingSearch(false);
    }
  };

  useEffect(() => {
    if (!loading && user && isAdmin) {
      loadDashboardStats();
      loadUploadedFiles();
    }
  }, [user, isAdmin, loading]);

  if (loading || loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9aa0a6'];

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground">Aperçu des statistiques du site</p>
          </div>
          <Button onClick={signOut} variant="outline">
            Déconnexion
          </Button>
        </div>

        {stats && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Recherches totales</CardTitle>
                  <Search className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalSearches}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visites totales</CardTitle>
                  <Eye className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalVisits}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Visites aujourd'hui</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.todayVisits}</div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Recherches par jour</CardTitle>
                  <CardDescription>7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      searches: {
                        label: "Recherches",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.searchesData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="searches" fill="var(--color-searches)" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Visites par jour</CardTitle>
                  <CardDescription>7 derniers jours</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      visits: {
                        label: "Visites",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={stats.visitsData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="visits" stroke="var(--color-visits)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>

            {/* Top Searches */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Top recherches</CardTitle>
                <CardDescription>Les termes les plus recherchés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {stats.topSearches.map((search, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="font-medium">{search.query}</span>
                      <span className="text-sm text-muted-foreground">{search.count} fois</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* File Upload Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Gestion des fichiers
            </CardTitle>
            <CardDescription>
              Téléchargez des fichiers .sql, .db, et .txt pour les rendre disponibles à la recherche
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <label htmlFor="file-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    {uploadingFile ? 'Upload en cours...' : 'Cliquez pour télécharger un fichier'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Formats acceptés: .sql, .db, .txt (max 10MB)
                  </p>
                </div>
                <input
                  id="file-upload"
                  type="file"
                  accept=".sql,.db,.txt"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                  className="hidden"
                />
              </label>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                  Fichiers disponibles ({uploadedFiles.length})
                </h3>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {uploadedFiles.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{file.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.file_size / 1024).toFixed(2)} KB • {file.file_type.toUpperCase()} • {new Date(file.created_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteFile(file.id, file.filename)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* File Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Moteur de recherche de fichiers
            </CardTitle>
            <CardDescription>
              Recherchez dans tous les fichiers téléchargés
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Input
                placeholder="Tapez votre recherche..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleFileSearch()}
                className="flex-1"
              />
              <Button 
                onClick={handleFileSearch} 
                disabled={loadingSearch || uploadedFiles.length === 0}
                className="flex items-center gap-2"
              >
                {loadingSearch ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Search className="h-4 w-4" />
                )}
                Rechercher
              </Button>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                <h3 className="font-semibold text-sm text-muted-foreground">
                  {searchResults.length} résultat(s) trouvé(s)
                </h3>
                {searchResults.map((result, index) => (
                  <div key={index} className="p-3 bg-muted rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-primary">
                          {result.file}
                        </span>
                        <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                          {result.type.toUpperCase()}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Ligne {result.line}
                      </span>
                    </div>
                    <code className="text-sm bg-background p-2 rounded block whitespace-pre-wrap overflow-x-auto">
                      {result.content}
                    </code>
                  </div>
                ))}
              </div>
            )}

            {searchQuery && searchResults.length === 0 && !loadingSearch && (
              <p className="text-center text-muted-foreground py-4">
                Aucun résultat trouvé pour "{searchQuery}"
              </p>
            )}

            {uploadedFiles.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Aucun fichier disponible. Téléchargez des fichiers pour commencer la recherche.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
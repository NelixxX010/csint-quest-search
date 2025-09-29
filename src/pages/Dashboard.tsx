import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Navigate } from 'react-router-dom';
import { Users, Search, TrendingUp, Eye, FileSearch, Database } from 'lucide-react';
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
  line: number;
  content: string;
}

const Dashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileSearchResult[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
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
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la recherche');
      }
      const results = await response.json();
      setSearchResults(results);
      
      toast({
        title: "Recherche terminée",
        description: `${results.length} résultat(s) trouvé(s)`,
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

        {/* File Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSearch className="h-5 w-5" />
              Moteur de recherche de fichiers
            </CardTitle>
            <CardDescription>
              Recherchez dans les fichiers .sql, .db, et .txt du serveur
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
                disabled={loadingSearch}
                className="flex items-center gap-2"
              >
                {loadingSearch ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Database className="h-4 w-4" />
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
                      <span className="text-sm font-medium text-primary">
                        {result.file}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Ligne {result.line}
                      </span>
                    </div>
                    <code className="text-sm bg-background p-2 rounded block whitespace-pre-wrap">
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
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
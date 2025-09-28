import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Navigate } from 'react-router-dom';
import { Users, Search, TrendingUp, Eye } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface DashboardStats {
  totalUsers: number;
  totalSearches: number;
  totalVisits: number;
  todayVisits: number;
  searchesData: Array<{ date: string; searches: number }>;
  visitsData: Array<{ date: string; visits: number }>;
  topSearches: Array<{ query: string; count: number }>;
}

const Dashboard = () => {
  const { user, isAdmin, loading, signOut } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && user && isAdmin) {
      loadDashboardStats();
    }
  }, [user, isAdmin, loading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);

      // Get total counts
      const [usersResult, searchesResult, visitsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('searches').select('*', { count: 'exact', head: true }),
        supabase.from('site_visits').select('*', { count: 'exact', head: true })
      ]);

      // Get today's visits
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount } = await supabase
        .from('site_visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      // Get searches data for last 7 days
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

      // Get top searches
      const { data: topSearchesData } = await supabase
        .from('searches')
        .select('query')
        .limit(100);

      // Process data for charts
      const searchesByDay = processDataByDay(searchesData || []);
      const visitsByDay = processDataByDay(visitsData || []);
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
    } finally {
      setLoadingStats(false);
    }
  };

  const processDataByDay = (data: Array<{ created_at: string }>) => {
    const dayMap = new Map();
    
    data.forEach(item => {
      const date = new Date(item.created_at).toLocaleDateString('fr-FR');
      dayMap.set(date, (dayMap.get(date) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([date, count]) => ({ date, searches: count, visits: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);
  };

  const processTopSearches = (data: Array<{ query: string }>) => {
    const queryMap = new Map();
    
    data.forEach(item => {
      queryMap.set(item.query, (queryMap.get(item.query) || 0) + 1);
    });

    return Array.from(queryMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  if (loadingStats) {
    return (
      <div className="min-h-screen bg-gradient-soft flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const COLORS = ['#1a73e8', '#34a853', '#fbbc04', '#ea4335', '#9aa0a6'];

  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-poppins font-bold text-foreground">Dashboard Admin</h1>
            <p className="text-muted-foreground font-inter">Statistiques en temps réel de CSint Search</p>
          </div>
          <Button onClick={signOut} variant="outline" className="font-inter">
            Déconnexion
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-medium border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-inter">Utilisateurs Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-poppins">{stats?.totalUsers || 0}</div>
              <p className="text-xs text-muted-foreground font-inter">Comptes créés</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-inter">Recherches Total</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-poppins">{stats?.totalSearches || 0}</div>
              <p className="text-xs text-muted-foreground font-inter">Requêtes effectuées</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-inter">Visites Total</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-poppins">{stats?.totalVisits || 0}</div>
              <p className="text-xs text-muted-foreground font-inter">Pages vues</p>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium font-inter">Visites Aujourd'hui</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-poppins">{stats?.todayVisits || 0}</div>
              <p className="text-xs text-muted-foreground font-inter">Aujourd'hui</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-medium border-0">
            <CardHeader>
              <CardTitle className="font-poppins">Recherches (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.searchesData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="searches" fill="#1a73e8" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="shadow-medium border-0">
            <CardHeader>
              <CardTitle className="font-poppins">Visites (7 derniers jours)</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats?.visitsData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line type="monotone" dataKey="visits" stroke="#34a853" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top Searches */}
        <Card className="shadow-medium border-0">
          <CardHeader>
            <CardTitle className="font-poppins">Top Recherches</CardTitle>
            <CardDescription className="font-inter">Les requêtes les plus populaires</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <ChartContainer config={{}} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.topSearches?.slice(0, 5) || []}
                        dataKey="count"
                        nameKey="query"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ query, percent }) => `${query} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {(stats?.topSearches?.slice(0, 5) || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="space-y-2">
                {(stats?.topSearches || []).map((search, index) => (
                  <div key={search.query} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                    <span className="font-inter font-medium">{search.query}</span>
                    <span className="text-sm text-muted-foreground">{search.count} fois</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
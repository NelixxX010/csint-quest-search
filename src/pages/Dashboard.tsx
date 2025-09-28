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

  // --- Déclarer AVANT useEffect ---
  const loadDashboardStats = async () => {
    try {
      setLoadingStats(true);

      // Récupérer les totaux
      const [usersResult, searchesResult, visitsResult] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('searches').select('*', { count: 'exact', head: true }),
        supabase.from('site_visits').select('*', { count: 'exact', head: true })
      ]);

      // Visites aujourd’hui
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
      const dateKey = item.created_at.split("T")[0]; // format ISO
      dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1);
    });

    return Array.from(dayMap.entries())
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString("fr-FR"), // affichage FR
        [type]: count
      }))
      .sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
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

  // --- rendu identique à ton code original ---
  return (
    <div className="min-h-screen bg-gradient-soft p-4">
      {/* ... ton rendu identique ... */}
    </div>
  );
};

export default Dashboard;

import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAnalytics() {
  useEffect(() => {
    // Track page visit
    const trackVisit = async () => {
      try {
        await supabase.from('site_visits').insert({
          page_path: window.location.pathname,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent
        });
      } catch (error) {
        console.log('Analytics tracking error:', error);
      }
    };

    trackVisit();
  }, []);

  const trackSearch = async (query: string, resultsCount: number = 0) => {
    try {
      await supabase.from('searches').insert({
        query,
        results_count: resultsCount,
        user_agent: navigator.userAgent
      });
    } catch (error) {
      console.log('Search tracking error:', error);
    }
  };

  return { trackSearch };
}
import { useEffect } from 'react';
import { useAnalyticsStore, AnalyticsData, MostAskedQuestion, DailyStatistic } from '../store/analyticsStore';
import { supabase } from '../integrations/supabase/client';

export const useAnalytics = () => {
  const { data, isLoading, error, setData, setLoading, setError } = useAnalyticsStore();

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch most asked questions (top 10)
      const { data: mostAskedData, error: mostAskedError } = await supabase
        .from('most_asked_questions')
        .select('*')
        .limit(10);

      if (mostAskedError) throw mostAskedError;

      // Fetch daily statistics (last 30 days)
      const { data: dailyStatsData, error: dailyStatsError } = await supabase
        .from('daily_statistics')
        .select('*')
        .limit(30);

      if (dailyStatsError) throw dailyStatsError;

      // Fetch total questions count
      const { count: totalCount, error: totalError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

      if (totalError) throw totalError;

      // Fetch questions today
      const today = new Date().toISOString().split('T')[0];
      const { count: todayCount, error: todayError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      if (todayError) throw todayError;

      // Fetch average response time
      const { data: avgTimeData, error: avgTimeError } = await supabase
        .from('responses')
        .select('processing_time_ms');

      if (avgTimeError) throw avgTimeError;

      const avgResponseTime = avgTimeData && avgTimeData.length > 0
        ? avgTimeData.reduce((sum, r) => sum + (r.processing_time_ms || 0), 0) / avgTimeData.length
        : 0;

      const analyticsData: AnalyticsData = {
        mostAskedQuestions: (mostAskedData as MostAskedQuestion[]) || [],
        dailyStatistics: (dailyStatsData as DailyStatistic[]) || [],
        totalQuestions: totalCount || 0,
        questionsToday: todayCount || 0,
        avgResponseTime: Math.round(avgResponseTime),
      };

      setData(analyticsData);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return {
    data,
    isLoading,
    error,
    refetch: fetchAnalytics,
  };
};

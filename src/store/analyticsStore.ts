import { create } from 'zustand';

export interface MostAskedQuestion {
  question_hash: string;
  question_text: string;
  ask_count: number;
  last_asked: string;
}

export interface DailyStatistic {
  date: string;
  total_questions: number;
  questions_with_context: number;
}

export interface AnalyticsData {
  mostAskedQuestions: MostAskedQuestion[];
  dailyStatistics: DailyStatistic[];
  totalQuestions: number;
  questionsToday: number;
  avgResponseTime: number;
}

interface AnalyticsState {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  setData: (data: AnalyticsData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  data: null,
  isLoading: false,
  error: null,
  setData: (data) => set({ data, error: null }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () => set({ data: null, isLoading: false, error: null }),
}));

import { useState, useEffect } from "react";
import { supabase } from "@/config/supabase";

export interface Interest {
  id: string;
  name: string;
  category: string;
  icon: string;
  created_at: string;
}

export const useInterests = () => {
  const [interests, setInterests] = useState<Interest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInterests();
  }, []);

  const loadInterests = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('interests')
        .select('*')
        .order('category')
        .order('name');

      if (error) throw error;
      setInterests(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load interests');
    } finally {
      setLoading(false);
    }
  };

  // Group interests by category
  const interestsByCategory = interests.reduce((acc, interest) => {
    if (!acc[interest.category]) {
      acc[interest.category] = [];
    }
    acc[interest.category].push(interest);
    return acc;
  }, {} as Record<string, Interest[]>);

  return { 
    interests, 
    interestsByCategory, 
    loading, 
    error, 
    refetch: loadInterests 
  };
};
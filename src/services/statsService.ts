import { supabase } from '../config/supabase';
import { MemeStats, StatType } from '../types/meme';

export const statsService = {
  async incrementStat(memeId: string, stat: StatType): Promise<void> {
    const { error } = await supabase.rpc('increment_meme_stat', {
      p_meme_id: memeId,
      p_stat_column: `${stat}_count`
    });

    if (error) {
      console.error(`Error incrementing ${stat}:`, error);
      throw error;
    }
  },

  async getStats(memeId: string): Promise<MemeStats> {
    const { data, error } = await supabase
      .from('memes')
      .select('view_count, favorite_count, share_count, download_count')
      .eq('id', memeId)
      .single();

    if (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }

    return {
      view_count: data?.view_count ?? 0,
      favorite_count: data?.favorite_count ?? 0,
      share_count: data?.share_count ?? 0,
      download_count: data?.download_count ?? 0
    };
  }
};

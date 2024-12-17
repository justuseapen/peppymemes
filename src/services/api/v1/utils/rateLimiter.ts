import { supabase } from '../../../../config/supabase';

const TIER_LIMITS = {
  free: 100,
  developer: 10000,
  enterprise: Infinity
} as const;

export class RateLimiter {
  private cache: Map<string, { count: number; resetTime: number }>;

  constructor() {
    this.cache = new Map();
  }

  async checkLimit(apiKeyId: string, tier: keyof typeof TIER_LIMITS): Promise<boolean> {
    const now = Date.now();
    const resetTime = this.getResetTime();
    const cacheKey = `${apiKeyId}:${resetTime}`;

    // Get current usage from cache or initialize
    let usage = this.cache.get(cacheKey);
    if (!usage || now >= usage.resetTime) {
      usage = { count: 0, resetTime };
      this.cache.set(cacheKey, usage);
    }

    // Increment usage
    usage.count++;

    // Check if over limit
    if (usage.count > TIER_LIMITS[tier]) {
      return false;
    }

    // Update usage in database (do this async, don't wait for it)
    this.updateUsageInDb(apiKeyId, usage.count).catch(console.error);

    return true;
  }

  private getResetTime(): number {
    const now = new Date();
    // Reset at midnight UTC
    const tomorrow = new Date(now);
    tomorrow.setUTCHours(24, 0, 0, 0);
    return tomorrow.getTime();
  }

  private async updateUsageInDb(apiKeyId: string, count: number) {
    try {
      await supabase
        .from('api_key_usage')
        .upsert({
          api_key_id: apiKeyId,
          date: new Date().toISOString().split('T')[0],
          request_count: count
        });
    } catch (error) {
      console.error('Error updating API key usage:', error);
    }
  }
}

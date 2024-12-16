export interface Meme {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
  created_at: string;
  user_id?: string;
  favorite_count: number;
  view_count: number;
  share_count: number;
  download_count: number;
  is_favorited?: boolean;
}

export interface MemeStats {
  favorite_count: number;
  view_count: number;
  share_count: number;
  download_count: number;
}

export type StatType = 'favorite' | 'view' | 'share' | 'download';

export interface Favorite {
  id: string;
  user_id: string;
  meme_id: string;
  created_at: string;
}

export interface Meme {
  id: number;
  title: string;
  image_url: string;
  tags: string[];
  created_at: string;
  user_id?: string;
}

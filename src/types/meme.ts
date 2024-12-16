export interface Meme {
  id: string;
  title: string;
  image_url: string;
  tags: string[];
  created_at: string;
  user_id?: string;
}

export interface Meme {
  id: string;
  imageUrl: string;
  title: string;
  tags: string[];
  createdAt: Date;
  creator: string;
}
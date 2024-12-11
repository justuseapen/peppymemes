export interface User {
  id: string;
  email: string;
  username: string | null;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
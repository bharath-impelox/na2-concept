export interface LoginResponse {
  refreshToken: string;
  token: string;
  user: User;
  defaultWorkspace: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  provider: string;
  isNewUser: boolean;
}

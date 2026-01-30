export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface GoogleLoginDTO {
  credential: string;
}

export interface AuthResponseDTO {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

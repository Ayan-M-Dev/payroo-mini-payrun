export interface LoginRequest {
  userId: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  type: string;
  expiresIn: string;
  userId: string;
}

export const authApi = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Login failed");
    }

    return response.json();
  },
};

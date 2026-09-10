import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// In Expo Android emulator, localhost is 10.0.2.2. In Web or iOS simulator, localhost is 127.0.0.1.
export const DEFAULT_API_URL = Platform.select({
  android: "http://10.0.2.2:5000/api",
  default: "http://localhost:5000/api"
});

class ApiClient {
  private baseUrl: string = DEFAULT_API_URL;

  public async setBaseUrl(url: string) {
    this.baseUrl = url;
    await AsyncStorage.setItem("@api_base_url", url);
  }

  public async getBaseUrl(): Promise<string> {
    const saved = await AsyncStorage.getItem("@api_base_url");
    if (saved) {
      this.baseUrl = saved;
    }
    return this.baseUrl;
  }

  private async getAuthHeader(): Promise<Record<string, string>> {
    const token = await AsyncStorage.getItem("@auth_token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<{ success: boolean; data?: T; message?: string; [key: string]: any }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const authHeaders = await this.getAuthHeader();

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
          ...(options.headers || {})
        }
      });

      const json = await response.json();
      return json;
    } catch (error: any) {
      // Network error or server offline
      return {
        success: false,
        message: "Unable to connect to server. Check your network or server status.",
        isOfflineError: true
      };
    }
  }

  public get<T = any>(endpoint: string) {
    return this.request<T>(endpoint, { method: "GET" });
  }

  public post<T = any>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body)
    });
  }

  public put<T = any>(endpoint: string, body?: any) {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined
    });
  }
}

export const api = new ApiClient();

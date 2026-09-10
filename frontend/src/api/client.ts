import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// Use EXPO_PUBLIC_API_URL for deployed builds. Keep local defaults for development.
const ENV_API_URL =
  typeof process !== "undefined" && process.env?.EXPO_PUBLIC_API_URL
    ? process.env.EXPO_PUBLIC_API_URL.replace(/\/$/, "")
    : undefined;

export const DEFAULT_API_URL =
  ENV_API_URL ||
  Platform.select({
    android: "http://10.0.2.2:5000/api",
    default: "http://localhost:5000/api"
  }) ||
  "http://localhost:5000/api";

class ApiClient {
  private baseUrl: string = DEFAULT_API_URL;

  public async setBaseUrl(url: string) {
    const normalizedUrl = url.trim().replace(/\/$/, "");
    this.baseUrl = normalizedUrl;
    await AsyncStorage.setItem("@api_base_url", normalizedUrl);
  }

  public async getBaseUrl(): Promise<string> {
    const saved = await AsyncStorage.getItem("@api_base_url");
    if (saved) {
      this.baseUrl = saved.replace(/\/$/, "");
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
      const baseUrl = await this.getBaseUrl();
      const normalizedEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
      const url = `${baseUrl}${normalizedEndpoint}`;
      const authHeaders = await this.getAuthHeader();

      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...authHeaders,
          ...(options.headers || {})
        }
      });

      const contentType = response.headers.get("content-type") || "";
      const json = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        return {
          success: false,
          message:
            json?.message ||
            `Request failed (${response.status}). Please try again.`,
          status: response.status
        };
      }

      if (!json || typeof json !== "object") {
        return {
          success: false,
          message: "Server returned an invalid response."
        };
      }

      return json;
    } catch (error) {
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
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  }
}

export const api = new ApiClient();

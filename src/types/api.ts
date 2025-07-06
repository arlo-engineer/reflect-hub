export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface SaveReflectionResponse {
  success: boolean;
  commitSha: string;
  commitUrl: string;
  filePath: string;
}

export type SaveStatus = "idle" | "saving" | "success" | "error";

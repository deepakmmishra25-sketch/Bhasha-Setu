// ─── Auth ──────────────────────────────────────────────────────────────
export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  language?: string;
  state?: string;
  occupation?: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

// ─── User ──────────────────────────────────────────────────────────────
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  language: string;
  state?: string;
  occupation?: string;
  avatarUrl?: string;
  joinedAt: string;
  completedLessons: number;
  certificates: number;
}

// ─── Lessons ───────────────────────────────────────────────────────────
export interface Category {
  id: number;
  slug: string;
  name: string;
  nameHindi?: string;
  description: string;
  icon: string;
  color: string;
  lessonCount: number;
}

export interface Lesson {
  id: number;
  categorySlug: string;
  categoryName?: string;
  title: string;
  titleHindi?: string;
  description: string;
  level: string;
  durationMinutes: number;
  language: string;
  thumbnailUrl?: string;
  completed: boolean;
  bookmarked: boolean;
}

// ─── Chat ──────────────────────────────────────────────────────────────
export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  language: string;
  createdAt: string;
}

// ─── Schemes ───────────────────────────────────────────────────────────
export interface Scheme {
  id: number;
  name: string;
  nameHindi?: string;
  category: string;
  description: string;
  eligibility: string;
  benefits: string;
  documents: string[];
  applicationProcess: string;
  ministry: string;
  websiteUrl?: string;
}

// ─── API Response ──────────────────────────────────────────────────────
export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

 
// Types for website audit results
export interface AuditIssues {
  title: string;
  metaDescription: string;
  h1Count: number;
  hasH1: boolean;
  hasImages: boolean;
  hasSocialLinks: boolean;
  phoneNumbers: string[];
  wordCount: number;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
}

export interface AuditResult {
  success: boolean;
  url: string;
  issues: AuditIssues;
  insight: string;
  message: string;
  error?: string;
  savedToDatabase?: boolean;
}

// Types for leads/contacts
export interface Lead {
  id?: string;
  name?: string;
  phoneNumber: string;
  websiteUrl: string;
  companyName?: string;
  createdAt?: string;
  status?: 'new' | 'contacted' | 'responded' | 'converted';
}

// Types for campaigns
export interface Campaign {
  id?: string;
  name: string;
  message: string;
  goal: 'book_call' | 'promote' | 'consultation' | 'custom';
  leads: Lead[];
  status: 'draft' | 'processing' | 'sent' | 'failed';
  createdAt?: string;
  sentCount?: number;
  replyCount?: number;
}

// Types for API responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Types for the website scraper
export interface ScraperOptions {
  url: string;
  timeout?: number;
  userAgent?: string;
}

export interface ScraperResult {
  html: string;
  statusCode: number;
  contentType: string;
  headers: Record<string, string>;
}
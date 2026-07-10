import axios from 'axios';
import * as cheerio from 'cheerio';
import { AuditIssues } from '@/types';

export async function scrapeWebsite(url: string): Promise<{ html: string; issues: AuditIssues }> {
  try {
    const response = await axios.get(url, {
      timeout: 45000,
      maxRedirects: 3,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const html = response.data;
    const $ = cheerio.load(html);

    const title = $('title').text().trim() || 'Missing Title Tag';
    const metaDescription = $('meta[name="description"]').attr('content') || 'Missing Meta Description';
    const h1Count = $('h1').length;
    const hasH1 = h1Count > 0;
    const hasImages = $('img').length > 0;
    
    const socialLinks = {
      facebook: $('a[href*="facebook.com"]').first().attr('href') || '',
      twitter: $('a[href*="twitter.com"]').first().attr('href') || '',
      instagram: $('a[href*="instagram.com"]').first().attr('href') || '',
      linkedin: $('a[href*="linkedin.com"]').first().attr('href') || '',
    };
    
    const hasSocialLinks = Object.values(socialLinks).some(link => link !== '');
    const phoneNumbers = extractPhoneNumbers($);
    const wordCount = $('body').text().split(/\s+/).length;

    const issues: AuditIssues = {
      title,
      metaDescription,
      h1Count,
      hasH1,
      hasImages,
      hasSocialLinks,
      phoneNumbers,
      wordCount,
      socialLinks
    };

    return { html, issues };
  } catch (error: unknown) {
    console.error('Scraping error:', error);
    let errorMessage = 'Failed to scrape website';
    if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = `Failed to scrape website: ${(error as { message: string }).message}`;
    }
    throw new Error(errorMessage);
  }
}

function extractPhoneNumbers($: cheerio.CheerioAPI): string[] {
  const text = $('body').text();
  const patterns = [
    /\+?[1-9]\d{1,3}[-. ]?\(?\d{1,4}\)?[-. ]?\d{1,4}[-. ]?\d{1,9}/g,
    /\(?\d{3}\)?[-. ]?\d{3}[-. ]?\d{4}/g,
    /\d{3}[-. ]?\d{3}[-. ]?\d{4}/g,
    /\+\d{1,3}\s?\d{1,14}/g,
  ];

  let allMatches: string[] = [];
  for (const pattern of patterns) {
    const matches = text.match(pattern) || [];
    allMatches = [...allMatches, ...matches];
  }

  return [...new Set(allMatches)].slice(0, 5);
}

export function generateInsight(issues: AuditIssues): string {
  const insights = [];
  
  if (!issues.title || issues.title === 'Missing Title Tag') {
    insights.push('Missing or weak Title Tag - This significantly impacts SEO ranking');
  }
  
  if (!issues.metaDescription || issues.metaDescription === 'Missing Meta Description') {
    insights.push('No Meta Description - This reduces click-through rates from search results');
  }
  
  if (!issues.hasH1) {
    insights.push('No H1 heading - Poor content structure affects SEO and readability');
  }
  
  if (!issues.hasImages) {
    insights.push('No images - Less engaging visual content reduces user engagement');
  }
  
  if (!issues.hasSocialLinks) {
    insights.push('No social media links - Missed opportunity for building trust and connections');
  }

  if (issues.phoneNumbers.length === 0) {
    insights.push('No phone number found - This might reduce trust for potential customers');
  }

  return insights.length > 0 ? insights[0] : 'Your website looks well-optimized!';
}

export function generatePersonalizedMessage(issues: AuditIssues, insight: string): string {
  const phoneNumber = issues.phoneNumbers.length > 0 ? issues.phoneNumbers[0] : null;
  
  let message = 'Hi there! ';
  
  if (phoneNumber) {
    message += `I noticed you're using ${phoneNumber} on your website. `;
  }
  
  message += `I came across your website and found that ${insight.toLowerCase()}. `;
  message += 'I specialize in fixing these exact issues and helping businesses like yours improve their online presence. ';
  message += 'Would you be open to a quick chat about how I could help you? No pressure at all.';
  
  return message;
}
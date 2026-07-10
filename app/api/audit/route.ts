import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite, generateInsight, generatePersonalizedMessage } from '@/lib/scraper';
import { supabase } from '@/lib/supabase';
import { AuditResult } from '@/types';

export async function POST(req: NextRequest) {
  try {
    // Get the URL from the request body
    const body = await req.json();
    const { url } = body;

    // Validate URL
    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL is required' },
        { status: 400 }
      );
    }

    // Validate URL format
    let validUrl: string;
    try {
      // Add https:// if no protocol is specified
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        validUrl = `https://${url}`;
      } else {
        validUrl = url;
      }
      new URL(validUrl); // This will throw if invalid
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid URL format. Please include http:// or https://' },
        { status: 400 }
      );
    }

    // Scrape the website
    const { html, issues } = await scrapeWebsite(validUrl);

    // Generate insights and message
    const insight = generateInsight(issues);
    const message = generatePersonalizedMessage(issues, insight);

    // Prepare SEO issues as array
    const seoIssues = [];
    if (!issues.title || issues.title === 'Missing Title Tag') seoIssues.push('Missing Title Tag');
    if (!issues.metaDescription || issues.metaDescription === 'Missing Meta Description') seoIssues.push('Missing Meta Description');
    if (!issues.hasH1) seoIssues.push('No H1 Heading');
    if (!issues.hasImages) seoIssues.push('No Images Found');
    if (!issues.hasSocialLinks) seoIssues.push('No Social Media Links');

    // Save to Supabase
    const { data, error } = await supabase
      .from('leads')
      .insert([
        {
          url: validUrl,
          website_title: issues.title,
          meta_description: issues.metaDescription,
          phone_numbers: issues.phoneNumbers,
          seo_issues: seoIssues,
          insight: insight,
          personalized_message: message,
          word_count: issues.wordCount,
          has_h1: issues.hasH1,
          has_images: issues.hasImages,
          has_social_links: issues.hasSocialLinks,
          status: 'new'
        }
      ])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      // Don't fail the request if save fails, just log it
    }

    // Prepare the response
    const result: AuditResult = {
      success: true,
      url: validUrl,
      issues,
      insight,
      message,
      savedToDatabase: !!data
    };

    return NextResponse.json(result);

  } catch (error) {
    console.error('Audit API error:', error);
    
    // Handle specific errors
    let errorMessage = 'Failed to audit website';
    if (error.message?.includes('ENOTFOUND')) {
      errorMessage = 'Website not found. Please check the URL and try again.';
    } else if (error.message?.includes('ETIMEDOUT')) {
      errorMessage = 'Website took too long to respond. Please try again later.';
    } else if (error.message?.includes('403')) {
      errorMessage = 'Access denied. The website is blocking our request.';
    } else if (error.message) {
      errorMessage = error.message;
    }

    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

// Optional: Add a GET endpoint to check if the API is working
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BizReach Audit API is running',
    version: '1.0.0'
  });
}
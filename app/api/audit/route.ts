import { NextRequest, NextResponse } from 'next/server';
import { scrapeWebsite, generateInsight, generatePersonalizedMessage } from '@/lib/scraper';

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

    // Prepare the response
    const result = {
      success: true,
      url: validUrl,
      issues,
      insight,
      message
    };

    return NextResponse.json(result);

  } catch (error: any) {
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

// GET endpoint to check if API is working
export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'BizReach Audit API is running',
    version: '1.0.0'
  });
}
import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory storage (resets on server restart)
let visitorCount = 0;
let auditCount = 0;
let visitors: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, url } = body || {};

    const visitor = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      action: action || 'visit',
      url: url || ''
    };

    visitors.push(visitor);
    
    if (action === 'audit') {
      auditCount++;
    } else {
      visitorCount++;
    }

    // Keep only last 100 visitors (to avoid memory issues)
    if (visitors.length > 100) {
      visitors = visitors.slice(-100);
    }

    return NextResponse.json({
      success: true,
      totalVisitors: visitorCount,
      totalAudits: auditCount
    });

  } catch (error: unknown) {
    console.error('Visitor API error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to track visitor'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    totalVisitors: visitorCount,
    totalAudits: auditCount,
    recentVisitors: visitors.slice(-10)
  });
}
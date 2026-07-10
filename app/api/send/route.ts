 import { NextRequest, NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { leads, message } = body;

    if (!leads || leads.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No leads provided' },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    // Process each lead
    const results = {
      sent: 0,
      failed: 0,
      errors: [] as string[]
    };

    for (const lead of leads) {
      try {
        // Personalize the message
        let personalizedMessage = message
          .replace(/{name}/g, lead.name || 'Business')
          .replace(/{phone}/g, lead.phone || '')
          .replace(/{website}/g, lead.website || '');

        // In production, this would send via WhatsApp API
        // For now, we'll store in Redis for demo
        const messageId = `msg_${Date.now()}_${Math.random().toString(36).slice(7)}`;
        
        await redis.hset(`message:${messageId}`, {
          to: lead.phone || 'No phone',
          name: lead.name || 'Unknown',
          message: personalizedMessage,
          status: 'queued',
          createdAt: new Date().toISOString()
        });

        // Add to queue for processing
        await redis.lpush('whatsapp_queue', messageId);

        results.sent++;

        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        results.failed++;
        results.errors.push(`Failed for ${lead.name}: ${error.message}`);
        console.error(`Error sending to ${lead.name}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      sent: results.sent,
      failed: results.failed,
      errors: results.errors,
      message: `Queued ${results.sent} messages for sending`
    });

  } catch (error) {
    console.error('Send error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to send messages'
      },
      { status: 500 }
    );
  }
}

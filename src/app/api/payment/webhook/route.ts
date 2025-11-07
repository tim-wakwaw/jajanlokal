import { NextRequest, NextResponse } from 'next/server';
import { verifyXenditWebhook } from '@/lib/xendit';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const webhookToken = request.headers.get('x-callback-token');
    
    if (!webhookToken) {
      return NextResponse.json(
        { error: 'Missing webhook token' },
        { status: 401 }
      );
    }

    // Verify webhook token
    const isValid = verifyXenditWebhook(
      process.env.XENDIT_WEBHOOK_TOKEN || '',
      webhookToken
    );

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid webhook token' },
        { status: 401 }
      );
    }

    const payload = await request.json();
    console.log('📥 Xendit webhook received:', payload);

    const { external_id, status, id } = payload;

    // Map Xendit status to our payment status
    let paymentStatus = 'pending';
    let orderStatus = 'pending';

    if (status === 'PAID') {
      paymentStatus = 'paid';
      orderStatus = 'confirmed';
    } else if (status === 'EXPIRED') {
      paymentStatus = 'expired';
      orderStatus = 'cancelled';
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        status: orderStatus,
        midtrans_transaction_id: id, // Store Xendit payment ID
        updated_at: new Date().toISOString(),
      })
      .eq('id', external_id);

    if (updateError) {
      console.error('❌ Order update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    console.log(`✅ Order ${external_id} updated: ${paymentStatus}`);

    // If payment is successful, clear cart items for this user
    if (status === 'PAID') {
      // Get user_id from order
      const { data: orderData } = await supabase
        .from('orders')
        .select('user_id')
        .eq('id', external_id)
        .single();

      if (orderData?.user_id) {
        await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', orderData.user_id);
        
        console.log(`🛒 Cart cleared for user ${orderData.user_id}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

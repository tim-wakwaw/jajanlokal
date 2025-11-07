import { NextRequest, NextResponse } from 'next/server';
import { createXenditInvoice } from '@/lib/xendit';
import { createClient } from '@supabase/supabase-js';

// Use service role client to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      customerAddress,
      notes,
      cartItems,
    } = body;

    // Validate required fields
    if (!userId || !customerName || !customerEmail || !customerPhone || !customerAddress) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate total amount
    const totalAmount = cartItems.reduce(
      (sum: number, item: { price: number; quantity: number }) =>
        sum + item.price * item.quantity,
      0
    );

    // Create order in database
    console.log('Creating order with data:', {
      user_id: userId,
      products: cartItems,
      total_amount: totalAmount,
    });

    const { data: orderData, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert({
        user_id: userId,
        products: cartItems,
        total_amount: totalAmount,
        status: 'pending',
        payment_status: 'pending',
        delivery_address: customerAddress,
        phone: customerPhone,
        notes: notes || null,
      })
      .select()
      .single();

    if (orderError || !orderData) {
      console.error('❌ Order creation error:', orderError);
      console.error('Error details:', JSON.stringify(orderError, null, 2));
      return NextResponse.json(
        { error: 'Failed to create order', details: orderError?.message || 'Unknown error' },
        { status: 500 }
      );
    }

    console.log('✅ Order created:', orderData.id);

    console.log('✅ Order created:', orderData.id);

    // Create Xendit invoice
    console.log('Creating Xendit invoice...');
    
    try {
      const invoice = await createXenditInvoice({
        orderId: orderData.id,
        amount: totalAmount,
        customerName,
        customerEmail,
        customerPhone,
        customerAddress,
        items: cartItems.map((item: { product_name: string; quantity: number; price: number }) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      console.log('✅ Xendit invoice created:', invoice.id);

      // Update order with Xendit invoice ID
      await supabaseAdmin
        .from('orders')
        .update({
          midtrans_order_id: invoice.id, // Reuse column for Xendit invoice ID
        })
        .eq('id', orderData.id);

      return NextResponse.json({
        success: true,
        orderId: orderData.id,
        invoiceUrl: invoice.invoice_url,
        invoiceId: invoice.id,
      });
    } catch (xenditError) {
      console.error('❌ Xendit error:', xenditError);
      console.error('Xendit error details:', xenditError instanceof Error ? xenditError.message : String(xenditError));
      
      // Return error dengan detail Xendit
      return NextResponse.json(
        { 
          error: 'Failed to create Xendit invoice',
          details: xenditError instanceof Error ? xenditError.message : String(xenditError),
          orderId: orderData.id // Order tetap created tapi Xendit gagal
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Checkout error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Checkout failed',
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 }
    );
  }
}

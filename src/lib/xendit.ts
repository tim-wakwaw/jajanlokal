import Xendit from 'xendit-node';

// Check for Xendit secret key with fallback for build time
const xenditSecretKey = process.env.XENDIT_SECRET_KEY;

if (!xenditSecretKey && process.env.NODE_ENV !== 'development') {
  console.warn('XENDIT_SECRET_KEY is not defined in environment variables');
}

// Initialize Xendit client only if secret key is available
const xenditClient = xenditSecretKey ? new Xendit({
  secretKey: xenditSecretKey,
}) : null;

export interface CreateInvoiceParams {
  orderId: string;
  amount: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export interface XenditInvoiceResponse {
  id: string;
  invoice_url: string;
  expiry_date: string;
  status: string;
}

/**
 * Create Xendit Invoice for payment
 */
export async function createXenditInvoice(
  params: CreateInvoiceParams
): Promise<XenditInvoiceResponse> {
  try {
    if (!xenditClient) {
      throw new Error('Xendit client not initialized - XENDIT_SECRET_KEY missing');
    }

    const { Invoice } = xenditClient;

    // Create invoice with proper SDK structure
    const invoice = await Invoice.createInvoice({
      data: {
        externalId: params.orderId,
        amount: params.amount,
        payerEmail: params.customerEmail,
        description: `Order ${params.orderId}`,
        customer: {
          givenNames: params.customerName,
          email: params.customerEmail,
          mobileNumber: params.customerPhone,
          addresses: [
            {
              city: 'Jakarta',
              country: 'Indonesia',
              postalCode: '12345',
              streetLine1: params.customerAddress,
            },
          ],
        },
        customerNotificationPreference: {
          invoiceCreated: ['email'],
          invoiceReminder: ['email'],
          invoicePaid: ['email'],
        },
        successRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?order_id=${params.orderId}`,
        failureRedirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/payment/failed?order_id=${params.orderId}`,
        currency: 'IDR',
        items: params.items.map((item) => ({
          name: item.name,
          quantity: item.quantity,
          price: item.price,
        })),
      },
    });

    return {
      id: invoice.id || '',
      invoice_url: invoice.invoiceUrl || '',
      expiry_date: invoice.expiryDate ? invoice.expiryDate.toISOString() : '',
      status: invoice.status || 'PENDING',
    };
  } catch (error) {
    console.error('Xendit invoice creation error:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to create invoice'
    );
  }
}

/**
 * Verify Xendit webhook signature
 */
export function verifyXenditWebhook(
  webhookToken: string,
  requestToken: string
): boolean {
  return webhookToken === requestToken;
}

export default xenditClient;

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { buffer } from 'micro';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// CRITICAL: Disable Next.js body parsing to get raw body for signature verification
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  if (!sig) {
    return res.status(400).json({ error: 'Signature manquante' });
  }

  let event: Stripe.Event;

  try {
    // CRITICAL: Verify webhook signature
    event = stripe.webhooks.constructEvent(
      buf,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('Erreur vérification signature webhook:', err.message);
    return res.status(400).json({ error: `Webhook signature invalide: ${err.message}` });
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    const projectId = session.metadata?.projectId;
    const userId = session.metadata?.userId;

    if (!projectId || !userId) {
      console.error('Metadata manquantes dans la session:', session.id);
      return res.status(400).json({ error: 'Metadata manquantes' });
    }

    // Update project payment status
    const { error } = await supabase
      .from('projects')
      .update({
        payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
        stripe_checkout_session_id: session.id,
      })
      .eq('id', projectId)
      .eq('user_id', userId);

    if (error) {
      console.error('Erreur mise à jour projet:', error);
      return res.status(500).json({ error: 'Erreur mise à jour projet' });
    }

    console.log(`✅ Paiement confirmé pour le projet ${projectId}`);
  }

  return res.status(200).json({ received: true });
}

import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-09-30.clover',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Verify authentication
    const supabase = createPagesServerClient({ req, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return res.status(401).json({ error: 'Non authentifié' });
    }

    const { projectId } = req.body;

    if (!projectId) {
      return res.status(400).json({ error: 'Project ID requis' });
    }

    // Verify project belongs to user
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .eq('user_id', session.user.id)
      .single();

    if (projectError || !project) {
      return res.status(404).json({ error: 'Projet non trouvé' });
    }

    // Check if already paid
    if (project.payment_status === 'paid') {
      return res.status(400).json({ error: 'Ce projet a déjà été payé' });
    }

    // Create Stripe Checkout Session
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: 'Génération d\'image IA',
              description: 'Transformation d\'image avec IA',
            },
            unit_amount: 200, // 2.00 EUR in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`,
      metadata: {
        projectId: projectId,
        userId: session.user.id,
      },
    });

    // Store the checkout session ID
    await supabase
      .from('projects')
      .update({
        stripe_checkout_session_id: checkoutSession.id,
        payment_amount: 2.00,
      })
      .eq('id', projectId);

    return res.status(200).json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Erreur création session Stripe:', error);
    return res.status(500).json({ error: error.message });
  }
}

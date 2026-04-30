import { Stripe } from "https://esm.sh/stripe?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  httpClient: Stripe.createFetchHttpClient(),
});

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, // Bypasses RLS to update status
);

Deno.serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  console.log("Stripe webhook received", {
    method: req.method,
    hasSignature: Boolean(signature),
  });

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature!,
      Deno.env.get("STRIPE_WEBHOOK_SECRET")!,
    );

    console.log("Stripe webhook event constructed", {
      type: event.type,
      id: event.id,
    });

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const jobId = session.metadata?.job_id;

      console.log("Checkout session completed", {
        sessionId: session.id,
        jobId,
      });

      if (jobId) {
        // 1. Mark as Paid
        const { error } = await supabase
          .from("print_jobs")
          .update({ status: "paid" })
          .eq("id", jobId);

        if (error) throw error;
        console.log(`Job ${jobId} marked as paid!`);
      } else {
        console.warn("Checkout session completed without job_id metadata", {
          sessionId: session.id,
        });
      }
    }

    console.log("Stripe webhook handled successfully", {
      eventType: event.type,
    });
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Stripe webhook failed", { message });
    return new Response(`Webhook Error: ${message}`, { status: 400 });
  }
});

import { Stripe } from "https://esm.sh/stripe";
import { PDFDocument } from "https://cdn.skypack.dev/pdf-lib";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

Deno.serve(async (req) => {
  const { jobId, filePath, isColor, merchantId } = await req.json();

  // 1. ANALYZE PDF
  const { data: fileData, error: downloadError } = await supabase.storage.from(
    "print_files",
  )
    .download(filePath);

  if (downloadError || !fileData) {
    console.error("Supabase storage download error:", downloadError);
    return new Response(JSON.stringify({ error: "File not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const arrayBuffer = await fileData.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const pages = pdfDoc.getPageCount();

  // 2. CALCULATE PRICE (฿1 min vs 5% scaling)
  const ratePerPage = isColor ? 10 : 1;
  const totalAmount = pages * ratePerPage;

  // Thai Baht to Satang (฿1 = 100)
  const totalInSatang = Math.max(1000, totalAmount * 100);
  const applicationFee = Math.max(100, totalInSatang * 0.05);

  // 3. SYNC DATABASE (Optional but recommended)
  await supabase.from("print_jobs").update({
    page_count: pages,
    amount_due: totalAmount,
  }).eq("id", jobId);

  // 4. CREATE STRIPE SESSION
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card", "promptpay"],
    metadata: { job_id: jobId },
    line_items: [{
      price_data: {
        currency: "thb",
        product_data: { name: `Print Job (${pages} pages)` },
        unit_amount: totalInSatang,
      },
      quantity: 1,
    }],
    mode: "payment",
    payment_intent_data: {
      application_fee_amount: Math.round(applicationFee),
      transfer_data: { destination: merchantId },
      metadata: { job_id: jobId },
    },
    success_url: `${Deno.env.get("CLIENT_URL")}/success`,
    cancel_url: `${Deno.env.get("CLIENT_URL")}/cancel`,
  });

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { "Content-Type": "application/json" },
  });
});

// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SB_URL") ?? Deno.env.get("SUPABASE_URL")!;
const SERVICE_KEY  = Deno.env.get("SB_SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

// Email (Resend)
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const EMAIL_FROM     = Deno.env.get("EMAIL_FROM") ?? "";

// SMS (Twilio)
const TWILIO_SID     = Deno.env.get("TWILIO_SID") ?? "";
const TWILIO_TOKEN   = Deno.env.get("TWILIO_TOKEN") ?? "";
const TWILIO_FROM    = Deno.env.get("TWILIO_FROM") ?? ""; // optional if using MSG service
const TWILIO_MSG_SVC = Deno.env.get("TWILIO_MESSAGING_SERVICE_SID") ?? ""; // MGxxxx

const BATCH_LIMIT  = Number(Deno.env.get("BATCH_LIMIT") ?? 50);
const MAX_ATTEMPTS = Number(Deno.env.get("MAX_ATTEMPTS") ?? 5);

type QueueRow = {
  id: string;
  claim_id: string;
  claim_type: string;
  new_status: string;
  prev_status: string | null;
  email: string | null;
  phone_number: string | null;
  user_id: string | null;
  attempts: number | null;
};

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (d: unknown, s = 200) =>
  new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json", ...cors } });

const subject = (status: string, id: string) => `Claim ${id}: ${status}`;
const html = (q: QueueRow) =>
  `<div style="font-family:system-ui"><h2>Claim Update</h2><p><b>Claim ID:</b> ${q.claim_id}</p><p><b>Status:</b> ${q.new_status}${q.prev_status ? ` (was ${q.prev_status})` : ""}</p><p><b>Type:</b> ${q.claim_type}</p></div>`;
const sms = (q: QueueRow) => `Claim ${q.claim_id} is now "${q.new_status}".${q.prev_status ? ` (was ${q.prev_status})` : ""}`;
const toE164 = (s?: string | null) => (s && /^[0-9]+$/.test(s) ? `+${s}` : s?.startsWith("+") ? s : null);

async function sendEmail(to: string, sub: string, bodyHtml: string) {
  if (!RESEND_API_KEY || !EMAIL_FROM) {
    return { skipped: true, reason: "Missing RESEND_API_KEY or EMAIL_FROM" };
  }
  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: EMAIL_FROM, to, subject: sub, html: bodyHtml }),
  });
  const text = await r.text();
  return { skipped: false, ok: r.ok, status: r.status, error: r.ok ? null : text };
}

async function sendSms(to: string, body: string) {
  if (!TWILIO_SID || !TWILIO_TOKEN) {
    return { skipped: true, reason: "Missing TWILIO_SID or TWILIO_TOKEN" };
  }
  const auth = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;

  const params = new URLSearchParams();
  if (TWILIO_MSG_SVC) {
    params.set("MessagingServiceSid", TWILIO_MSG_SVC);
  } else if (TWILIO_FROM) {
    params.set("From", TWILIO_FROM);
  } else {
    return { skipped: true, reason: "Missing TWILIO_FROM or TWILIO_MESSAGING_SERVICE_SID" };
  }
  params.set("To", to);
  params.set("Body", body);

  const r = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const text = await r.text();
  return { skipped: false, ok: r.ok, status: r.status, error: r.ok ? null : text };
}

async function fetchJobs(filter?: { claim_id?: string }) {
  let q = supabase.from("notification_queue")
    .select("*")
    .is("processed_at", null)
    .lt("attempts", MAX_ATTEMPTS)
    .order("created_at", { ascending: true })
    .limit(BATCH_LIMIT);
  if (filter?.claim_id) q = q.eq("claim_id", filter.claim_id);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as QueueRow[];
}
async function markSuccess(id: string) {
  await supabase.from("notification_queue")
    .update({ processed_at: new Date().toISOString(), last_error: null })
    .eq("id", id);
}
async function markFailure(id: string, attempts: number, err: unknown) {
  await supabase.from("notification_queue")
    .update({ attempts: attempts + 1, last_error: String(err) })
    .eq("id", id);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  // Health check/debug
  if (req.method === "GET") {
    return json({
      ok: true,
      env: {
        url: SUPABASE_URL.replace(/^https?:\/\//, ""),
        used_url_env: Deno.env.get("SB_URL") ? "SB_URL" : "SUPABASE_URL",
        used_key_env: Deno.env.get("SB_SERVICE_ROLE_KEY") ? "SB_SERVICE_ROLE_KEY" : "SUPABASE_SERVICE_ROLE_KEY",
      },
      limits: { BATCH_LIMIT, MAX_ATTEMPTS },
    });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const jobs = await fetchJobs({ claim_id: body.claim_id });
    const results: any[] = [];
    let processed = 0;

    for (const j of jobs) {
      try {
        const emailRes = j.email ? await sendEmail(j.email, subject(j.new_status, j.claim_id), html(j)) : { skipped: true };
        const phone = toE164(j.phone_number);
        const smsRes = phone ? await sendSms(phone, sms(j)) : { skipped: true };

        if ((emailRes as any).ok === false || (smsRes as any).ok === false) {
          await markFailure(j.id, j.attempts ?? 0, `[Email] ${JSON.stringify(emailRes)} , [SMS] ${JSON.stringify(smsRes)}`);
          results.push({ id: j.id, claim_id: j.claim_id, emailResult: emailRes, smsResult: smsRes, success: false });
          continue;
        }
        await markSuccess(j.id);
        processed++;
        results.push({ id: j.id, claim_id: j.claim_id, emailResult: emailRes, smsResult: smsRes, success: true });
      } catch (e) {
        await markFailure(j.id, j.attempts ?? 0, e);
        results.push({ id: j.id, claim_id: j.claim_id, error: String(e), success: false });
      }
    }
    return json({ found: jobs.length, processed, results });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

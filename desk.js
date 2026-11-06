/* Getnos Desk — landing page lead submit
   Call once per form submit. Each answer is its own JSON field.
   Extra / custom keys are saved too (city, role, space_type, …). */

const DESK_URL = "https://deskbackend.getnos.io/v1/lead";
const API_KEY = "lh_u3xQxHIHMfWMVDrAci_qUhkP6FYvA7R5DmrjDKwBaVE";

let submitting = false;

/**
 * @param {Record<string, string>} fields flat lead answers (any custom keys OK)
 * @returns {Promise<{ status?: string, leadId?: string, duplicate?: boolean, skipped?: boolean, message?: string }>}
 */
export async function submitLead(fields) {
  if (submitting) return { duplicate: true, skipped: true };
  submitting = true;
  try {
    const res = await fetch(DESK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        form: "contact",
        honeypot: fields.honeypot || "",
        // Spread ALL form answers — known + custom fields become columns
        ...fields,
        // Email subject override for this lead:
        subject: fields.subject || "New Homebrands Sylphconsultancy Lead",
      }),
      keepalive: true,
    });

    let data = {};
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // Desk ignores identical payloads for ~15 min — treat as success
    if (data.duplicate) return data;

    if (!res.ok) {
      throw new Error(data.message || `Lead submit failed (${res.status})`);
    }

    return data; // { status: "success", leadId }
  } finally {
    submitting = false;
  }
}

if (typeof window !== "undefined") {
  window.submitLead = submitLead;
}

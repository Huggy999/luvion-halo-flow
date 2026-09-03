import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * GDPR right to erasure: deletes the account and everything attached to it.
 * Runs on the server so the deletion cannot be faked from the browser.
 */
export const deleteAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = context.userId;

    // The subscriber row holds the plan, the Stripe ids and the Lumi counter.
    await supabaseAdmin.from("subscribers").delete().eq("user_id", userId);

    const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
    if (error) {
      return {
        ok: false as const,
        message: `The account was not deleted — ${error.message}. Your data is untouched, try again.`,
      };
    }
    return { ok: true as const, message: "The account and its data are deleted." };
  });

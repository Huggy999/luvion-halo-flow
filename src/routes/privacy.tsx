import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy — Luvion" },
      {
        name: "description",
        content:
          "What data Luvion collects, why it is collected, how long it is kept, how to export it and how to delete the account.",
      },
      { property: "og:title", content: "Privacy — Luvion" },
      {
        property: "og:description",
        content: "Data collected, purposes, retention, export and account deletion in Luvion.",
      },
    ],
  }),
  component: PrivacyScreen,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "What we collect",
    body: [
      "Account data: your email address and an encrypted password hash, created when you sign up.",
      "Product data: the hubs, tasks, docs, halo streak and focus sessions you create in the app.",
      "Billing data: your plan, the subscription period end and the identifiers Stripe returns. Card numbers are handled by Stripe and never reach our servers.",
      "Assistant data: the questions you send to Lumi, the answers, and a monthly counter of requests.",
    ],
  },
  {
    title: "Why we collect it",
    body: [
      "To run the product you asked for: storing your work and showing it back to you across devices.",
      "To count Lumi requests against your plan, which is a contractual necessity.",
      "To take payment and to let you cancel without contacting anyone.",
      "We set no analytics or marketing cookies, so no consent banner is shown. If analytics is ever added, consent will be opt-in and refusing will be as easy as accepting.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Product data is kept while your account exists.",
      "Billing records are kept for the period required by tax law in your country, typically up to ten years.",
      "When you delete your account, product and account data are removed immediately, and only legally required billing records remain.",
    ],
  },
  {
    title: "How to export your data",
    body: [
      "Open Profile and use Export my data. You get a JSON file with hubs, tasks and docs, plus Markdown and CSV files.",
      "Export works on every plan, including a free plan and an expired subscription.",
    ],
  },
  {
    title: "How to delete your account",
    body: [
      "Open Profile, choose Delete account, and confirm. It takes two taps and no support request.",
      "Deletion removes the account, the plan record and the Lumi counter. It cannot be undone, so export first if you want a copy.",
    ],
  },
  {
    title: "Your rights and contact",
    body: [
      "You can access, correct, export and erase your data, and object to processing. Under the GDPR you may also complain to your local supervisory authority.",
      "Contact for privacy requests: privacy@example.com. Replace this placeholder with the operator's real contact before launch.",
    ],
  },
];

function PrivacyScreen() {
  return (
    <div className="cascade space-y-4">
      <header>
        <p className="label-xs text-ink-3">Luvion</p>
        <h1 className="t-screen mt-1 text-ink">Privacy</h1>
      </header>

      <p className="px-1 t-body font-normal text-ink-2">
        This page describes what the app stores and what you can do about it. It is a working
        placeholder structure and should be reviewed by the operator before launch.
      </p>

      {SECTIONS.map((section) => (
        <section key={section.title} className="card p-4" aria-label={section.title}>
          <h2 className="t-title text-ink">{section.title}</h2>
          <ul className="mt-2 space-y-2 t-body font-normal text-ink-2">
            {section.body.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>
        </section>
      ))}

      <p className="px-1 t-aux text-ink-2">
        <Link to="/terms" style={{ color: "var(--blue-ink)" }}>
          Terms
        </Link>{" "}
        ·{" "}
        <Link to="/profile" style={{ color: "var(--blue-ink)" }}>
          Back to Profile
        </Link>
      </p>
    </div>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: "Terms — Luvion" },
      {
        name: "description",
        content:
          "The terms of using Luvion: the service, plans and payment, cancellation, your data and account deletion.",
      },
      { property: "og:title", content: "Terms — Luvion" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:description",
        content: "Service, plans, cancellation, data ownership and account deletion in Luvion.",
      },
    ],
  }),
  component: TermsScreen,
});

const SECTIONS: { title: string; body: string[] }[] = [
  {
    title: "The service",
    body: [
      "Luvion is a productivity app with hubs, tasks, a board, docs, a halo streak, a focus timer and an assistant called Lumi.",
      "The halo, the streak and the focus timer are free on every plan and will not become paid.",
    ],
  },
  {
    title: "Plans and payment",
    body: [
      "Free includes three hubs, one board, twenty Lumi requests a month and unlimited docs.",
      "Pro adds unlimited hubs and boards, one thousand Lumi requests a month, export and the dark theme with gold glow.",
      "Team adds shared hubs, roles and a shared team halo.",
      "Paid plans renew monthly until cancelled. Prices are shown in the currency of your region before you pay.",
    ],
  },
  {
    title: "Cancellation and refunds",
    body: [
      "You can cancel in two taps on the Plans screen through subscription management. No support request is needed.",
      "After cancellation your data stays fully readable, and export keeps working. Only creating beyond the free limits and Lumi requests are restricted.",
      "EU consumers have a fourteen day right of withdrawal for digital subscriptions, unless the service was fully performed with your prior consent.",
    ],
  },
  {
    title: "Your content",
    body: [
      "Your hubs, tasks and docs remain yours. We store them to provide the service and never sell them.",
      "You are responsible for the content you store and for the accuracy of what you ask Lumi to work with.",
    ],
  },
  {
    title: "Account deletion",
    body: [
      "You can delete your account in Profile at any time. Deletion is permanent, so export your data first if you want a copy.",
    ],
  },
  {
    title: "Liability and changes",
    body: [
      "The service is provided as is, without a guarantee of uninterrupted availability. Statutory consumer rights are not affected.",
      "If these terms change, the new version is published here with the date of the change.",
      "This is a working placeholder structure and should be reviewed by the operator before launch.",
    ],
  },
];

function TermsScreen() {
  return (
    <div className="cascade space-y-4">
      <header>
        <p className="label-xs text-ink-3">Luvion</p>
        <h1 className="t-screen mt-1 text-ink">Terms</h1>
      </header>

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
        <Link to="/privacy" style={{ color: "var(--blue-ink)" }}>
          Privacy
        </Link>{" "}
        ·{" "}
        <Link to="/profile" style={{ color: "var(--blue-ink)" }}>
          Back to Profile
        </Link>
      </p>
    </div>
  );
}

/**
 * Static content for the /book-consultation "Proof & Guarantees" block
 * (ProofGuaranteesSection, VideoProofCard, FeedbackProofGrid, TrustStepsCard
 * in components/ui/). Kept static and out of the content_sections CMS for
 * this phase — see app/admin/(dashboard)/pages/book-consultation/BookConsultationEditor.tsx,
 * which is untouched. Shaped the same way the CMS-backed page sections
 * already are ({eyebrow, title, subtitle, items}) so wiring this into
 * content_sections later is additive, not a rewrite.
 */

export const proofGuarantees = {
  eyebrow: "What we can guarantee",
  title: "What We Can Guarantee",
  subtitle:
    "We don't promise vanity metrics. We build a clear lead generation and appointment-setting system you can track, review, and improve.",
  items: [
    {
      title: "Clear Pipeline Visibility",
      text: "You'll know where every lead came from, what happened next, and what needs follow-up.",
    },
    {
      title: "No Guesswork Reporting",
      text: "We track lead volume, lead quality, booked appointments, and pipeline movement — not just clicks.",
    },
    {
      title: "Qualified Lead Focus",
      text: "Our system is built to attract, filter, and prioritize prospects that match your service and budget.",
    },
    {
      title: "Fast Follow-Up System",
      text: "We help reduce lost opportunities by making sure new leads can be followed up quickly and clearly.",
    },
    {
      title: "No Long-Term Lock-In",
      text: "The system is designed to prove value through execution, tracking, and consistent improvement.",
    },
  ],
};

export const proofVideo = {
  eyebrow: "See it in action",
  title: "See How The System Works",
  text: "A short walkthrough showing how Netlink turns traffic into qualified leads and booked conversations.",
  // Relative to /public — see lib/publicAsset.ts. Drop a file here to go live,
  // no code changes needed.
  videoPath: "proof/netlink-proof-video.mp4",
};

export const proofFeedback = {
  eyebrow: "Social proof",
  title: "Real Feedback From Growth Conversations",
  text: "Client feedback, call notes, and UGC snippets from real growth conversations.",
  items: [
    {
      source: "Client Feedback",
      quote: "We finally had a clear view of which leads were worth following up.",
      role: "",
      screenshotPath: "proof/feedback-1.webp",
    },
    {
      source: "Client Feedback",
      quote: "The biggest difference was having a system, not just ads.",
      role: "",
      screenshotPath: "proof/feedback-2.webp",
    },
    {
      source: "Call Note",
      quote: "Lead quality improved once the funnel and follow-up process were connected.",
      role: "",
      screenshotPath: "proof/feedback-3.webp",
    },
    {
      source: "UGC",
      quote: "Straightforward process — I always knew what stage a lead was at.",
      role: "",
      screenshotPath: "proof/ugc-1.webp",
    },
  ],
};

export const trustSteps = {
  title: "What happens after you submit?",
  steps: [
    "We review your business, offer, and current lead flow.",
    "We check whether Netlink is a strong fit.",
    "We contact you within one business day with the next step.",
  ],
  footer: "No spam. No pressure. Just a clear growth conversation.",
};

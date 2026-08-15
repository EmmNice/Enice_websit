import { defineTool } from "@lovable.dev/mcp-js";

const VENTURES = [
  {
    slug: "pulsepay",
    name: "PulsePay",
    category: "Payment infrastructure",
    description:
      "High-velocity ledger and payment core for African and cross-border payment flows.",
  },
  {
    slug: "pulseassist",
    name: "PulseAssist",
    category: "Regulated support operations",
    description:
      "AI-native customer operations platform for regulated financial and telecom support.",
  },
  {
    slug: "epulse",
    name: "EPulse",
    category: "Digital banking",
    description: "Digital banking layer extending the ENICE Core into consumer and SME banking.",
  },
  {
    slug: "pulsex",
    name: "PulseX",
    category: "Global digital asset trading",
    description: "Institutional-grade global cryptocurrency and digital asset trading exchange.",
  },
];

export default defineTool({
  name: "list_ventures",
  title: "List ENICE ventures",
  description:
    "List the ventures inside the ENICE Group studio (PulsePay, PulseAssist, EPulse, PulseX) with a short description of each.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(VENTURES, null, 2) }],
    structuredContent: { ventures: VENTURES },
  }),
});

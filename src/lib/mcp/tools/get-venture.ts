import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";

const DETAILS: Record<
  string,
  { name: string; category: string; description: string; status: string }
> = {
  pulsepay: {
    name: "PulsePay",
    category: "Payment infrastructure",
    description:
      "High-velocity ledger and payment core for African and cross-border payment flows.",
    status: "Operational (99.9%)",
  },
  pulseassist: {
    name: "PulseAssist",
    category: "Regulated support operations",
    description:
      "AI-native customer operations platform for regulated financial and telecom support.",
    status: "Operational",
  },
  epulse: {
    name: "EPulse",
    category: "Digital banking",
    description: "Digital banking layer extending the ENICE Core into consumer and SME banking.",
    status: "In incubation",
  },
  pulsex: {
    name: "PulseX",
    category: "Global digital asset trading",
    description: "Institutional-grade global cryptocurrency and digital asset trading exchange.",
    status: "In incubation",
  },
};

export default defineTool({
  name: "get_venture",
  title: "Get ENICE venture details",
  description:
    "Return details for a single ENICE venture by its slug (pulsepay, pulseassist, epulse, pulsex).",
  inputSchema: {
    slug: z.enum(["pulsepay", "pulseassist", "epulse", "pulsex"]).describe("Venture slug."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ slug }) => {
    const venture = DETAILS[slug];
    if (!venture) {
      return {
        content: [{ type: "text", text: `Unknown venture: ${slug}` }],
        isError: true,
      };
    }
    return {
      content: [{ type: "text", text: JSON.stringify(venture, null, 2) }],
      structuredContent: venture,
    };
  },
});

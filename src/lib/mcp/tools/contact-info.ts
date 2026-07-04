import { defineTool } from "@lovable.dev/mcp-js";

const CONTACT = {
  organization: "ENICE Group",
  founder: "Godson Chukwukemeka",
  email: "corporate@enicegroup.com",
  responseTime: "Within 2 business days",
  contactPage: "/contact",
};

export default defineTool({
  name: "get_contact_info",
  title: "Get ENICE Group contact info",
  description:
    "Return public contact information for ENICE Group partnerships and inquiries.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text", text: JSON.stringify(CONTACT, null, 2) }],
    structuredContent: CONTACT,
  }),
});

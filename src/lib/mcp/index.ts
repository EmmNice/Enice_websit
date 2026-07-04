import { defineMcp } from "@lovable.dev/mcp-js";
import listVentures from "./tools/list-ventures";
import getVenture from "./tools/get-venture";
import contactInfo from "./tools/contact-info";

export default defineMcp({
  name: "enice-group-mcp",
  title: "ENICE Group MCP",
  version: "0.1.0",
  instructions:
    "Public tools for ENICE Group. Use list_ventures to enumerate the studio's ventures (PulsePay, PulseAssist, EPulse, PulseX), get_venture for details on one, and get_contact_info for partnership contact details.",
  tools: [listVentures, getVenture, contactInfo],
});

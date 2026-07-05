import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "enice-group-studio",
  title: "ENICE Group",

  projectId: "v87jayow",
  dataset: "production",

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.listItem()
              .title("Blog Posts")
              .child(
                S.documentList()
                  .title("Blog Posts")
                  .filter('_type == "post" && category == "BLOG"')
              ),
            S.listItem()
              .title("Changelog")
              .child(
                S.documentList()
                  .title("Changelog")
                  .filter('_type == "post" && category in ["CHANGELOG","UPDATE"]')
              ),
            S.listItem()
              .title("Announcements")
              .child(
                S.documentList()
                  .title("Announcements")
                  .filter('_type == "post" && category == "ANNOUNCEMENT"')
              ),
            S.divider(),
            S.listItem()
              .title("All Posts")
              .child(S.documentList().title("All Posts").filter('_type == "post"')),
          ]),
    }),
    visionTool(),
  ],

  schema: {
    types: schemaTypes,
  },
});

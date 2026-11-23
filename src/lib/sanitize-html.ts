import sanitizeHtml from "sanitize-html";

const ALLOWED_TAGS = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "h2",
  "h3",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "img",
];

const SANITIZE_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ALLOWED_TAGS,
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedSchemesByTag: {
    img: ["https", "http"],
  },
  allowProtocolRelative: false,
  disallowedTagsMode: "discard",
  transformTags: {
    a: (_tagName, attribs) => {
      const nextAttribs: Record<string, string> = {};
      if (attribs.href) {
        nextAttribs.href = attribs.href;
      }
      if (attribs.target === "_blank") {
        nextAttribs.target = "_blank";
        nextAttribs.rel = "noopener noreferrer";
      } else if (attribs.rel) {
        nextAttribs.rel = "noopener noreferrer";
      }
      return {
        tagName: "a",
        attribs: nextAttribs,
      };
    },
  },
};

export function sanitizePostHtml(rawHtml: string | null | undefined): string {
  if (!rawHtml) {
    return "";
  }
  return sanitizeHtml(rawHtml, SANITIZE_OPTIONS);
}

export async function strip_tag(content, tag = "p") {
  return await content().then((content) =>
    content
      .replace(new RegExp(`<${tag}>`, "g"), "")
      .replace(new RegExp(`</${tag}>`, "g"), ""),
  );
}

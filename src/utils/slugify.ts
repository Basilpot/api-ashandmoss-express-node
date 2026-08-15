export function slugify(text: string) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // remove special chars
      .replace(/[\s_-]+/g, "-") // replace spaces & underscores with hyphen
      .replace(/--+/g, "-") // collapse multiple hyphens
      .replace(/^-+|-+$/g, ""); // trim hyphens from start/end
}

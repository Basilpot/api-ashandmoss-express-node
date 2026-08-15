import prisma from "@/lib/prisma";

export type AutoFooterProduct = { id: number; title: string; slug: string };
export type AutoFooterInfoPage = { id: string; title: string; slug: string | null };
export type AutoFooterTag = { slug: string; name: string; products: AutoFooterProduct[] };
export type AutoFooterBrand = { slug: string; name: string; products: AutoFooterProduct[] };

export type AutoFooterMenuItem = {
  id: string;
  label: string;
  url: string;
  children: AutoFooterMenuItem[];
};

const publishedProductSelect = {
  where: { status: "PUBLISHED" as const },
  select: { id: true, title: true, slug: true },
  orderBy: { title: "asc" as const },
};

const productItem = (p: AutoFooterProduct): AutoFooterMenuItem => ({
  id: `product-${p.id}`,
  label: p.title,
  url: `/product/${p.slug}`,
  children: [],
});

const pageItem = (p: AutoFooterInfoPage): AutoFooterMenuItem => ({
  id: `infopage-${p.id}`,
  label: p.title,
  url: `/${p.slug}`,
  children: [],
});

export function buildAutoFooterItems(input: {
  tags: AutoFooterTag[];
  brands: AutoFooterBrand[];
  infoPages: AutoFooterInfoPage[];
}): AutoFooterMenuItem[] {
  const items: AutoFooterMenuItem[] = [];

  const tagItems = input.tags
    .filter((t) => t.products.length > 0)
    .slice(0, 3)
    .map((t) => ({
      id: `tag-${t.slug}`,
      label: t.name,
      url: `/tag/${t.slug}`,
      children: t.products.map(productItem),
    }));

  items.push(...tagItems);

  const brandLinks = input.brands
    .filter((b) => b.products.length > 0)
    .map((b) => ({
      id: `brand-${b.slug}`,
      label: b.name,
      url: `/brand/${b.slug}`,
      children: [] as AutoFooterMenuItem[],
    }));

  if (brandLinks.length > 0) {
    items.push({ id: "brands", label: "Brands", url: "", children: brandLinks });
  }

  const pages = input.infoPages.filter((p) => p.slug);
  if (pages.length > 0) {
    items.push({
      id: "resources",
      label: "Resources",
      url: "",
      children: [...pages]
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(pageItem),
    });
  }

  return items;
}

export async function buildAutoFooter(): Promise<AutoFooterMenuItem[]> {
  const [tags, brands, infoPages] = await Promise.all([
    prisma.tag.findMany({
      select: {
        name: true,
        slug: true,
        products: publishedProductSelect,
      },
      orderBy: { createdAt: "asc" as const },
    }),
    prisma.brand.findMany({
      select: {
        name: true,
        slug: true,
        products: publishedProductSelect,
      },
    }),
    prisma.infoPage.findMany({
      where: { published: true },
      select: { id: true, title: true, slug: true },
    }),
  ]);

  return buildAutoFooterItems({ tags, brands, infoPages });
}

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(`buildAutoFooter self-check failed: ${msg}`);
};

const product = (id: number, title: string): AutoFooterProduct => ({
  id,
  title,
  slug: `${title}-${id}`,
});

const selfCheck = () => {
  // 3 tag sections + Brands column + Resources
  let items = buildAutoFooterItems({
    tags: [
      {
        slug: "best-sellers",
        name: "Best Sellers",
        products: [product(1, "Oxford Shirt"), product(2, "Bomber Jacket")],
      },
      { slug: "new-arrivals", name: "New Arrivals", products: [product(3, "Runners")] },
      { slug: "sale", name: "Sale", products: [product(4, "Lamp")] },
    ],
    brands: [{ slug: "nike", name: "Nike", products: [product(5, "Shoes")] }],
    infoPages: [
      { id: "p1", title: "About", slug: "about" },
      { id: "p2", title: "FAQ", slug: "faq" },
    ],
  });
  assert(items.length === 5, "3 tag sections + Brands + Resources");
  assert(items[0]!.label === "Best Sellers", "tag section titled by tag name");
  assert(items[0]!.children.length === 2, "tag section holds its products");
  assert(items[0]!.url === "/tag/best-sellers", "tag clean url");
  assert(items[1]!.label === "New Arrivals", "second tag section");
  assert(items[2]!.label === "Sale", "third tag section");
  assert(items[3]!.label === "Brands", "Brands column present");
  assert(items[3]!.children[0]!.label === "Nike", "brand link in Brands column");
  assert(items[3]!.children[0]!.url === "/brand/nike", "brand link clean url");
  assert(items[4]!.label === "Resources", "Resources section last");
  assert(items[4]!.children.length === 2, "Resources holds all info pages");
  assert(items.every((i) => !i.url.includes("?")), "footer has no query params");

  // empty tag dropped, capped at 3; empty brand dropped → no Brands column
  items = buildAutoFooterItems({
    tags: [
      { slug: "empty", name: "Empty", products: [] },
      { slug: "a", name: "A", products: [product(1, "1")] },
      { slug: "b", name: "B", products: [product(2, "2")] },
      { slug: "c", name: "C", products: [product(3, "3")] },
      { slug: "d", name: "D", products: [product(4, "4")] },
    ],
    brands: [{ slug: "none", name: "None", products: [] }],
    infoPages: [],
  });
  assert(items.length === 3, "empty tag dropped, capped at 3");
  assert(
    items.map((i) => i.label).join(",") === "A,B,C",
    "first 3 non-empty tags kept",
  );

  // pages sorted alphabetical
  items = buildAutoFooterItems({
    tags: [],
    brands: [],
    infoPages: [
      { id: "1", title: "Zebra", slug: "zebra" },
      { id: "2", title: "Alpha", slug: "alpha" },
    ],
  });
  assert(items.length === 1 && items[0]!.label === "Resources", "Resources only when no tags/brands");
  assert(
    items[0]!.children.map((c) => c.label).join(",") === "Alpha,Zebra",
    "Resources pages alphabetical",
  );

  // info page without slug dropped
  items = buildAutoFooterItems({
    tags: [],
    brands: [],
    infoPages: [{ id: "1", title: "No Slug", slug: null }],
  });
  assert(items.length === 0, "no slug → no Resources section");

  console.log("buildAutoFooter self-check: OK");
};

if (require.main === module) {
  selfCheck();
}

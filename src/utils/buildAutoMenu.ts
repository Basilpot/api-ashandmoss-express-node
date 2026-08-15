import prisma from "@/lib/prisma";

export type AutoProduct = { id: number; title: string; slug: string };
export type AutoSubcategory = { slug: string; name: string; products: AutoProduct[] };
export type AutoCategory = {
  slug: string;
  name: string;
  children: AutoSubcategory[];
  products: AutoProduct[];
};
export type AutoBrand = { slug: string; name: string; products: AutoProduct[] };

export type AutoMenuItem = {
  id: string;
  label: string;
  url: string;
  children: AutoMenuItem[];
  viewAllUrl?: string;
};

const publishedProductSelect = {
  where: { status: "PUBLISHED" as const },
  select: { id: true, title: true, slug: true },
  orderBy: { title: "asc" as const },
};

const productItem = (p: AutoProduct): AutoMenuItem => ({
  id: `product-${p.id}`,
  label: p.title,
  url: `/product/${p.slug}`,
  children: [],
});

const categoryUrl = (slug: string) => `/category/${slug}`;
const brandUrl = (slug: string) => `/brand/${slug}`;

export function buildAutoMenuItems(input: {
  categories: AutoCategory[];
  brands: AutoBrand[];
}): AutoMenuItem[] {
  const items: AutoMenuItem[] = [];
  const topLevel: AutoMenuItem[] = [];

  for (const cat of input.categories) {
    const subcategories = cat.children.filter((c) => c.products.length > 0);
    if (subcategories.length === 0 && cat.products.length === 0) continue;

    const children: AutoMenuItem[] =
      subcategories.length > 0
        ? subcategories.map((c) => ({
            id: `sub-${cat.slug}-${c.slug}`,
            label: c.name,
            url: categoryUrl(c.slug),
            viewAllUrl: categoryUrl(c.slug),
            children: c.products.map(productItem),
          }))
        : cat.products.map(productItem);

    topLevel.push({
      id: `cat-${cat.slug}`,
      label: cat.name,
      url: categoryUrl(cat.slug),
      viewAllUrl: categoryUrl(cat.slug),
      children,
    });
  }

  for (const brand of input.brands) {
    if (brand.products.length === 0) continue;
    topLevel.push({
      id: `brand-${brand.slug}`,
      label: brand.name,
      url: brandUrl(brand.slug),
      viewAllUrl: brandUrl(brand.slug),
      children: brand.products.map(productItem),
    });
  }

  topLevel.sort((a, b) => a.label.localeCompare(b.label));
  items.push(...topLevel);

  return items;
}

export async function buildAutoMenu(): Promise<AutoMenuItem[]> {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({
      where: { parentId: null },
      select: {
        name: true,
        slug: true,
        children: {
          select: {
            name: true,
            slug: true,
            products: publishedProductSelect,
          },
        },
        products: publishedProductSelect,
      },
      orderBy: { sortOrder: "asc" as const },
    }),
    prisma.brand.findMany({
      select: {
        name: true,
        slug: true,
        products: publishedProductSelect,
      },
    }),
  ]);

  return buildAutoMenuItems({ categories, brands });
}

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error(`buildAutoMenu self-check failed: ${msg}`);
};

const product = (id: number, title: string): AutoProduct => ({
  id,
  title,
  slug: `${title}-${id}`,
});

const selfCheck = () => {
  const input = {
    categories: [
      {
        slug: "electronics",
        name: "Electronics",
        children: [
          { slug: "audio", name: "Audio", products: [product(1, "Headphones")] },
          { slug: "empty", name: "Empty Sub", products: [] },
        ],
        products: [],
      },
      { slug: "empty-cat", name: "Empty Cat", children: [], products: [] },
    ],
    brands: [{ slug: "nike", name: "Nike", products: [product(2, "Runners")] }],
  };

  let items = buildAutoMenuItems(input);
  assert(items.length === 2, "non-empty category + brand on top level");
  assert(items[0]!.label === "Electronics", "categories sorted alphabetical");
  assert(items[0]!.children.length === 1, "empty subcategory dropped, one column");
  assert(items[0]!.children[0]!.label === "Audio", "mega title = subcategory");
  assert(
    items[0]!.children[0]!.children[0]!.label === "Headphones",
    "mega item = subcategory product",
  );
  assert(items[0]!.children[0]!.url === "/category/audio", "subcategory clean url");
  assert(items[0]!.children[0]!.children[0]!.url === "/product/Headphones-1", "product clean url");
  assert(items[1]!.label === "Nike", "brand on top level");
  assert(items[1]!.children[0]!.label === "Runners", "brand mega = its products");
  assert(items[1]!.url === "/brand/nike", "brand clean url");
  assert(items.every((i) => !i.url.includes("?")), "nav has no query params");

  // category with direct products but no subcategories → products as children
  items = buildAutoMenuItems({
    categories: [
      {
        slug: "sale",
        name: "Sale",
        children: [],
        products: [product(1, "Bargain")],
      },
    ],
    brands: [],
  });
  assert(items.length === 1, "direct-product category kept");
  assert(items[0]!.children[0]!.label === "Bargain", "products as children");

  // empty brand dropped
  items = buildAutoMenuItems({
    categories: [],
    brands: [{ slug: "empty", name: "Empty", products: [] }],
  });
  assert(items.length === 0, "empty brand dropped");

  // nothing → no items
  items = buildAutoMenuItems({ categories: [], brands: [] });
  assert(items.length === 0, "no content → no items");

  console.log("buildAutoMenu self-check: OK");
};

if (require.main === module) {
  selfCheck();
}

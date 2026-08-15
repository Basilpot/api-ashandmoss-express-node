import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "@lib/prisma";
import { randomBytes } from "node:crypto";
import { AdminType, ProductStatus } from "@prisma/client";

const UNSPLASH = (photo: string, w = 900) =>
  `https://images.unsplash.com/${photo}?auto=format&fit=crop&w=${w}&q=80`;

async function cleanup() {
  console.log("Cleaning existing data...");

  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.order.deleteMany(),
    prisma.variant.deleteMany(),
    prisma.review.deleteMany(),
    prisma.wishlist.deleteMany(),
    prisma.product.deleteMany(),
    prisma.tag.deleteMany(),
    prisma.brand.deleteMany(),
    prisma.category.deleteMany(),
    prisma.blog.deleteMany(),
    prisma.infoPage.deleteMany(),
    prisma.infoPageCategory.deleteMany(),
    prisma.newsletterSubscriber.deleteMany(),
    prisma.media.deleteMany(),
    prisma.redirect.deleteMany(),
    prisma.testimonial.deleteMany(),
    prisma.author.deleteMany(),
    prisma.admin.deleteMany(),
    prisma.user.deleteMany(),
    prisma.storeSetting.deleteMany(),
  ]);

  console.log("  Cleanup complete\n");
}

async function seed() {
  await cleanup();
  console.log("Seeding database...\n");

  const hash = await bcrypt.hash("password123", 10);

  // ── Store settings ─────────────────────────────────────────────────────
  await prisma.storeSetting.create({
    data: {
      id: 1,
      siteConfig: {
        name: "Ash and Moss",
        tagline: "Custom furniture, cut to your room.",
        description: "Ash and Moss — made-to-measure timber furniture from the workshop.",
        email: "hello@ashandmoss.com",
        phone: "+977 9841328947",
        address: "08 New Rd, Pokhara, Nepal",
        currency: "NPR",
        logo: "",
        palette: "ash-moss",
      },
      // auto:true → backend serves nav/footer computed from live categories,
      // brands, tags and info pages (items[] kept as a manual fallback).
      menu: {
        items: [
          { label: "Home", url: "/" },
          { label: "Explore", url: "/explore" },
          { label: "Contact", url: "/contact" },
        ],
        auto: true,
        version: "2.0.0",
        updatedAt: new Date().toISOString(),
      },
      footer: {
        items: [],
        auto: true,
        version: "2.0.0",
        updatedAt: new Date().toISOString(),
      },
      sidebarMenu: [
        {
          label: "Shop by Room",
          items: [
            { label: "Seating", url: "/categories/seating" },
            { label: "Tables", url: "/categories/tables" },
            { label: "Storage", url: "/categories/storage" },
            { label: "Beds", url: "/categories/beds" },
          ],
        },
      ],
    },
  });

  // ── Admin ──────────────────────────────────────────────────────────────
  const admin = await prisma.admin.create({
    data: {
      username: "admin",
      email: "admin@ashandmoss.com",
      password: hash,
      role: AdminType.SUPERADMIN,
    },
  });
  console.log(`  Admin created: ${admin.email} (password123)`);

  // ── Categories (2 levels) ──────────────────────────────────────────────
  const catImages: Record<string, string> = {
    "Seating": "photo-1555041469-a586c61ea9bc",
    "Lounge Chairs": "photo-1503602642458-232111445657",
    "Sofas": "photo-1549187774-b4e9b0445b41",
    "Dining Chairs": "photo-1550581190-9c1c48d21d6c",
    "Tables": "photo-1519710164239-da123dc03ef4",
    "Dining Tables": "photo-1519710164239-da123dc03ef4",
    "Desks": "photo-1518455027359-f3f8164ba6bd",
    "Side Tables": "photo-1524758631624-e2822e304c36",
    "Storage": "photo-1594620302200-9a762244a156",
    "Shelving": "photo-1594620302200-9a762244a156",
    "Cabinets": "photo-1556228453-efd6c1ff04f6",
    "Beds": "photo-1505693416388-ac5ce068fe85",
    "Platform Beds": "photo-1505693416388-ac5ce068fe85",
    "Bedside Tables": "photo-1507473885765-e6ed057f782c",
  };
  const catData = [
    { name: "Seating", children: ["Lounge Chairs", "Sofas", "Dining Chairs"] },
    { name: "Tables", children: ["Dining Tables", "Desks", "Side Tables"] },
    { name: "Storage", children: ["Shelving", "Cabinets"] },
    { name: "Beds", children: ["Platform Beds", "Bedside Tables"] },
  ];
  const categoryIds: Record<string, string> = {};
  for (const [i, c] of catData.entries()) {
    const parent = await prisma.category.create({
      data: { name: c.name, slug: slugify(c.name), image: UNSPLASH(catImages[c.name]!), sortOrder: i },
    });
    categoryIds[c.name] = parent.id;
    for (const [j, child] of c.children.entries()) {
      const sub = await prisma.category.create({
        data: {
          name: child,
          slug: slugify(child),
          image: UNSPLASH(catImages[child]!),
          sortOrder: j,
          parentId: parent.id,
        },
      });
      categoryIds[child] = sub.id;
    }
  }
  console.log(`  Categories seeded: ${catData.length} parents, ${catData.reduce((n, c) => n + c.children.length, 0)} children`);

  // ── Brands (workshop collections) ──────────────────────────────────────
  const brandNames = ["Fernwood", "Ashfield", "Moss & Cane"];
  const brands: Record<string, number> = {};
  for (const [i, name] of brandNames.entries()) {
    const b = await prisma.brand.create({
      data: { name, slug: slugify(name), isFeatured: i < 2, sortOrder: i },
    });
    brands[name] = b.id;
  }
  console.log(`  Brands seeded: ${brandNames.join(", ")}`);

  // ── Tags (storefront tabs) ─────────────────────────────────────────────
  const tagData = [
    { name: "Best Sellers", slug: "best-sellers", description: "Top-selling pieces" },
    { name: "New Arrivals", slug: "new-arrivals", description: "Fresh from the workshop" },
    { name: "Sale", slug: "sale", description: "Workshop clearance" },
    { name: "Limited Edition", slug: "limited-edition", description: "Small batch runs" },
  ];
  for (const t of tagData) {
    await prisma.tag.create({ data: t });
  }

  // ── Products with variants ─────────────────────────────────────────────
  const IMG: Record<string, [string, string, string]> = {
    "Fernwood Lounge Chair": [
      "photo-1503602642458-232111445657",
      "photo-1538688525198-9b88f6f53126",
      "photo-1567016432779-094069958ea5",
    ],
    "Moss Three-Seat Sofa": [
      "photo-1555041469-a586c61ea9bc",
      "photo-1493663284031-b7e3aefcae8e",
      "photo-1499856871958-5b9627545d1a",
    ],
    "Willow Two-Seat Sofa": [
      "photo-1549187774-b4e9b0445b41",
      "photo-1513694203232-719a280e022f",
      "photo-1492633423870-43d1cd2775eb",
    ],
    "Fernwood Dining Chair": [
      "photo-1550581190-9c1c48d21d6c",
      "photo-1534088568595-a066f410bcda",
      "photo-1516627145497-ae6968895b74",
    ],
    "Ashfield Dining Table": [
      "photo-1519710164239-da123dc03ef4",
      "photo-1519337265831-281ec6cc8514",
      "photo-1522708323590-d24dbb6b0267",
    ],
    "Elm Dining Bench": [
      "photo-1519415943484-9fa1873496d4",
      "photo-1549931319-a545dcf3bc73",
      "photo-1501183007986-d0d080b147f9",
    ],
    "Keeper Writing Desk": [
      "photo-1518455027359-f3f8164ba6bd",
      "photo-1533090481720-856c6e3c1fdc",
      "photo-1524638431109-93d95c968f03",
    ],
    "Pebble Side Table": [
      "photo-1524758631624-e2822e304c36",
      "photo-1493809842364-78817add7ffb",
      "photo-1416879595882-3373a0480b5b",
    ],
    "Slatted Ash Shelving": [
      "photo-1594620302200-9a762244a156",
      "photo-1513506003901-1e6a229e2d15",
      "photo-1499933374294-4584851497cc",
    ],
    "Cane & Oak Cabinet": [
      "photo-1556228453-efd6c1ff04f6",
      "photo-1583847268964-b28dc8f51f92",
      "photo-1492633423870-43d1cd2775eb",
    ],
    "Cane Platform Bed": [
      "photo-1505693416388-ac5ce068fe85",
      "photo-1505692952047-1a78307da8f2",
      "photo-1526170375885-4d8ecf77b99f",
    ],
    "Loft Bedside Table": [
      "photo-1507473885765-e6ed057f782c",
      "photo-1507652313519-d4e9174996dd",
      "photo-1522771739844-6a9f6d5f14af",
    ],
    "Pebble Round Lounge Chair": [
      "photo-1544724569-5f546fd6f2b5",
      "photo-1503602642458-232111445657",
      "photo-1567016432779-094069958ea5",
    ],
    "Keeper Compact Desk": [
      "photo-1533090481720-856c6e3c1fdc",
      "photo-1518455027359-f3f8164ba6bd",
      "photo-1524638431109-93d95c968f03",
    ],
    "Cane Daybed": [
      "photo-1507652313519-d4e9174996dd",
      "photo-1505693416388-ac5ce068fe85",
      "photo-1501183007986-d0d080b147f9",
    ],
  };

  const products = [
    {
      title: "Fernwood Lounge Chair",
      category: "Lounge Chairs",
      brand: "Fernwood",
      basePrice: 38500,
      compareAt: 42000,
      tags: ["Best Sellers", "New Arrivals"],
      featured: true,
      popularity: 96,
      description: "Low, deep and built for slow evenings. Steam-bent arms, a gently raked back, and a seat cushion filled with layered foam wrapped in moss-toned wool.",
      attributes: [
        { name: "Wood", value: "White Oak" },
        { name: "Finish", value: "Hardwax Oil" },
        { name: "Room", value: "Living Room" },
      ],
      variants: [
        { name: "White Oak / Hardwax Oil", price: 38500, compareAt: 42000, stock: 8 },
        { name: "Walnut / Natural", price: 41000, compareAt: 45000, stock: 5 },
      ],
    },
    {
      title: "Moss Three-Seat Sofa",
      category: "Sofas",
      brand: "Moss & Cane",
      basePrice: 185000,
      compareAt: 210000,
      tags: ["Best Sellers"],
      featured: true,
      popularity: 98,
      description: "Our signature three-seater on a kiln-dried beech frame. Removable, washable covers, pocket-sprung seat, and a slight curve that pulls conversation inward.",
      attributes: [
        { name: "Wood", value: "Beech" },
        { name: "Finish", value: "Natural" },
        { name: "Room", value: "Living Room" },
      ],
      variants: [
        { name: "Beech / Moss Wool", price: 185000, compareAt: 210000, stock: 4 },
        { name: "Beech / Belgian Linen", price: 192000, compareAt: 210000, stock: 3 },
      ],
    },
    {
      title: "Willow Two-Seat Sofa",
      category: "Sofas",
      brand: "Moss & Cane",
      basePrice: 132000,
      tags: ["New Arrivals"],
      featured: false,
      popularity: 84,
      description: "The Willow is the Moss sofa scaled for apartments: same beech frame and springing, a lighter footprint, and a slim arm that doubles as a perch for a book.",
      attributes: [
        { name: "Wood", value: "Beech" },
        { name: "Finish", value: "Natural" },
        { name: "Room", value: "Living Room" },
      ],
      variants: [
        { name: "Natural Linen", price: 132000, stock: 6 },
        { name: "Charcoal Wool", price: 138000, stock: 4 },
      ],
    },
    {
      title: "Fernwood Dining Chair",
      category: "Dining Chairs",
      brand: "Fernwood",
      basePrice: 24500,
      tags: ["Best Sellers", "Limited Edition"],
      featured: true,
      popularity: 88,
      description: "A dining chair that doesn't squeak or wobble. Solid ash legs, a sculpted seat from a single board, and a curved backrest that supports the lumbar.",
      attributes: [
        { name: "Wood", value: "Ash" },
        { name: "Finish", value: "Soap" },
        { name: "Room", value: "Dining Room" },
      ],
      variants: [
        { name: "Ash / Soap", price: 24500, stock: 30 },
        { name: "Walnut / Oiled", price: 26500, stock: 22 },
      ],
    },
    {
      title: "Ashfield Dining Table",
      category: "Dining Tables",
      brand: "Ashfield",
      basePrice: 145000,
      compareAt: 165000,
      tags: ["Best Sellers", "Sale"],
      featured: true,
      popularity: 95,
      description: "A live-edge oak top on turned legs. Seats six comfortably, eight if you shuffle. Each top is one board, dried over two years in the workshop.",
      attributes: [
        { name: "Wood", value: "Walnut" },
        { name: "Finish", value: "Hardwax Oil" },
        { name: "Room", value: "Dining Room" },
      ],
      variants: [
        { name: "Walnut / 200cm", price: 145000, compareAt: 165000, stock: 5 },
        { name: "Oak / 220cm", price: 158000, compareAt: 175000, stock: 3 },
      ],
    },
    {
      title: "Elm Dining Bench",
      category: "Dining Tables",
      brand: "Ashfield",
      basePrice: 48000,
      tags: ["New Arrivals"],
      featured: false,
      popularity: 72,
      description: "The bench that tucks under the Ashfield table. Tapered legs, a softly rounded top, and a weight that stays put when you slide in.",
      attributes: [
        { name: "Wood", value: "Elm" },
        { name: "Finish", value: "Hardwax Oil" },
        { name: "Room", value: "Dining Room" },
      ],
      variants: [
        { name: "Oak", price: 48000, stock: 12 },
        { name: "Walnut", price: 52000, stock: 9 },
      ],
    },
    {
      title: "Keeper Writing Desk",
      category: "Desks",
      brand: "Ashfield",
      basePrice: 98000,
      tags: ["Best Sellers"],
      featured: true,
      popularity: 90,
      description: "A desk with a shallow drawer deep enough for a notebook but too shallow for clutter. Cable channel in the back, oiled top that ages well.",
      attributes: [
        { name: "Wood", value: "Oak" },
        { name: "Finish", value: "Hardwax Oil" },
        { name: "Room", value: "Study" },
      ],
      variants: [
        { name: "Oak / Hardwax Oil", price: 98000, stock: 7 },
        { name: "Walnut", price: 104000, stock: 5 },
      ],
    },
    {
      title: "Keeper Compact Desk",
      category: "Desks",
      brand: "Ashfield",
      basePrice: 72000,
      compareAt: 80000,
      tags: ["Sale"],
      featured: false,
      popularity: 66,
      description: "The Keeper scaled for a corner: 90cm wide, still deep enough for a proper working surface, still built on solid timber.",
      attributes: [
        { name: "Wood", value: "Oak" },
        { name: "Finish", value: "Hardwax Oil" },
        { name: "Room", value: "Study" },
      ],
      variants: [
        { name: "Oak / 90cm", price: 72000, compareAt: 80000, stock: 9 },
      ],
    },
    {
      title: "Pebble Side Table",
      category: "Side Tables",
      brand: "Fernwood",
      basePrice: 18500,
      compareAt: 21000,
      tags: ["Sale"],
      featured: false,
      popularity: 76,
      description: "A low side table shaped like the river stones it's named for. Walnut base, oiled surface, small enough to carry from sofa to bed.",
      attributes: [
        { name: "Wood", value: "Walnut" },
        { name: "Finish", value: "Oiled" },
        { name: "Room", value: "Living Room" },
      ],
      variants: [
        { name: "Walnut / Oiled", price: 18500, compareAt: 21000, stock: 25 },
        { name: "Oak", price: 17800, compareAt: 20000, stock: 20 },
      ],
    },
    {
      title: "Slatted Ash Shelving",
      category: "Shelving",
      brand: "Ashfield",
      basePrice: 64000,
      tags: ["New Arrivals"],
      featured: false,
      popularity: 80,
      description: "Three or five slatted shelves on a freestanding ash frame. Gap between slats keeps books and records upright, no bracket shows.",
      attributes: [
        { name: "Wood", value: "Ash" },
        { name: "Finish", value: "Soap" },
        { name: "Room", value: "Study" },
      ],
      variants: [
        { name: "Ash / Soap / 3-shelf", price: 64000, stock: 10 },
        { name: "Ash / Soap / 5-shelf", price: 82000, stock: 8 },
      ],
    },
    {
      title: "Cane & Oak Cabinet",
      category: "Cabinets",
      brand: "Moss & Cane",
      basePrice: 112000,
      compareAt: 125000,
      tags: ["Limited Edition", "Sale"],
      featured: false,
      popularity: 78,
      description: "Cane panels breathe where solid doors would sweat. Two shallow drawers up top, roomy cabinet below — cut in small batches.",
      attributes: [
        { name: "Wood", value: "White Oak" },
        { name: "Finish", value: "Natural" },
        { name: "Room", value: "Living Room" },
      ],
      variants: [
        { name: "White Oak / Natural", price: 112000, compareAt: 125000, stock: 6 },
        { name: "Walnut", price: 118000, compareAt: 130000, stock: 4 },
      ],
    },
    {
      title: "Cane Platform Bed",
      category: "Platform Beds",
      brand: "Moss & Cane",
      basePrice: 168000,
      tags: ["Best Sellers", "New Arrivals"],
      featured: true,
      popularity: 94,
      description: "A low platform bed with a cane headboard that breathes and a solid oak frame you can sit on without a creak. Slatted base, no box spring.",
      attributes: [
        { name: "Wood", value: "White Oak" },
        { name: "Finish", value: "Natural" },
        { name: "Room", value: "Bedroom" },
      ],
      variants: [
        { name: "White Oak / Queen", price: 168000, stock: 5 },
        { name: "White Oak / King", price: 182000, stock: 4 },
      ],
    },
    {
      title: "Cane Daybed",
      category: "Platform Beds",
      brand: "Moss & Cane",
      basePrice: 148000,
      tags: ["Limited Edition"],
      featured: false,
      popularity: 71,
      description: "Twin width, sofa height. Cane back, oak frame, ready to serve as a reading seat by day and a guest bed by night.",
      attributes: [
        { name: "Wood", value: "White Oak" },
        { name: "Finish", value: "Natural" },
        { name: "Room", value: "Bedroom" },
      ],
      variants: [
        { name: "White Oak / Twin", price: 148000, stock: 6 },
      ],
    },
    {
      title: "Loft Bedside Table",
      category: "Bedside Tables",
      brand: "Fernwood",
      basePrice: 15500,
      tags: ["Best Sellers"],
      featured: false,
      popularity: 68,
      description: "One small drawer, one open shelf, one soap-finished ash body. Tall enough to hold a lamp, low enough to disappear.",
      attributes: [
        { name: "Wood", value: "Ash" },
        { name: "Finish", value: "Soap" },
        { name: "Room", value: "Bedroom" },
      ],
      variants: [
        { name: "Ash / Soap", price: 15500, stock: 40 },
        { name: "Walnut", price: 16500, stock: 35 },
      ],
    },
    {
      title: "Pebble Round Lounge Chair",
      category: "Lounge Chairs",
      brand: "Fernwood",
      basePrice: 32000,
      tags: ["New Arrivals"],
      featured: false,
      popularity: 74,
      description: "A round, swivel-free lounge chair with a wrapped seat that cups you. Oak base, wool cushion, no sharp corners anywhere.",
      attributes: [
        { name: "Wood", value: "Oak" },
        { name: "Finish", value: "Hardwax Oil" },
        { name: "Room", value: "Living Room" },
      ],
      variants: [
        { name: "Oak / Wool", price: 32000, stock: 12 },
      ],
    },
  ];

  const productIds: number[] = [];
  for (const p of products) {
    const price = p.basePrice;
    const maxPrice = p.variants.reduce((m, v) => Math.max(m, v.price), 0) || price;
    const product = await prisma.product.create({
      data: {
        title: p.title,
        slug: slugify(p.title),
        description: p.description,
        price,
        maxPrice: maxPrice > price ? maxPrice : null,
        compareAtPrice: p.compareAt ?? null,
        images: IMG[p.title]!.map((id) => UNSPLASH(id)),
        attributes: p.attributes,
        faq: [
          { q: "How long does this piece take to make?", a: "Each item is made to order in the workshop. Lead time is 4–8 weeks depending on timber and season." },
          { q: "What timber and finish does it use?", a: "Details are listed under attributes. Finishes are water-based oils and soaps — no lacquer, no plastic coat." },
          { q: "Is it made from solid wood?", a: "Yes. Frames and tops are solid kiln-dried timber, joined with dowels and glue — no MDF." },
          { q: "Can I return it if it doesn't fit?", a: "Unmade orders can be cancelled free of charge within 14 days. Made-to-measure pieces are final sale." },
        ],
        metaTitle: p.title,
        metaDescription: p.description.slice(0, 150),
        metaKeywords: [p.title, ...p.attributes.map((a) => a.value)].join(","),
        metaRobots: "index,follow",
        isFeatured: p.featured,
        popularityScore: p.popularity,
        status: ProductStatus.PUBLISHED,
        categoryId: categoryIds[p.category]!,
        brandId: brands[p.brand]!,
        tags: {
          connect: tagData.filter((t) => p.tags.includes(t.name)).map((t) => ({ slug: t.slug })),
        },
        variants: {
          create: p.variants.map((v, i) => ({
            name: v.name,
            sku: `${slugify(p.title)}-${i + 1}`.slice(0, 20).toUpperCase(),
            price: v.price,
            compareAtPrice: "compareAt" in v ? (v.compareAt ?? null) : null,
            stock: v.stock,
            image: IMG[p.title]![0] ? UNSPLASH(IMG[p.title]![0]) : null,
            sortOrder: i,
          })),
        },
      },
    });
    productIds.push(product.id);
  }
  console.log(`  Products seeded: ${products.length} (related pieces share a category)`);

  // ── Demo customer ──────────────────────────────────────────────────────
  const user = await prisma.user.create({
    data: {
      username: "bikash",
      name: "Bikash Shrestha",
      email: "bikash@example.com",
      password: hash,
      phone: "9800000000",
      emailVerified: true,
    },
  });
  console.log(`  Customer seeded: ${user.email} (password123)`);

  // ── Sample reviews ─────────────────────────────────────────────────────
  for (const id of productIds) {
    await prisma.review.create({
      data: {
        rating: 5,
        text: "Solid joinery, true to the photos, and the timber smells incredible.",
        reviewerId: user.id,
        productId: id,
      },
    });
  }

  // ── Wishlist ───────────────────────────────────────────────────────────
  await prisma.wishlist.create({ data: { itemId: productIds[0]!, userId: user.id } });

  // ── Demo completed order (shows on dashboard) ──────────────────────────
  const demoItem = products[0]!;
  const unitPrice = demoItem.variants[0]!.price;
  await prisma.order.create({
    data: {
      orderNumber: "ORD-DEMO-0001",
      name: user.name,
      email: user.email,
      phone: user.phone!,
      address: "New Baneshwor, Kathmandu",
      city: "Kathmandu",
      totalAmount: unitPrice,
      status: "COMPLETED",
      items: {
        create: [
          {
            productId: productIds[0]!,
            productName: demoItem.title,
            variantId: null,
            variantName: null,
            quantity: 1,
            unitPrice,
            lineTotal: unitPrice,
          },
        ],
      },
      payment: {
        create: {
          amount: unitPrice,
          status: "SUCCESS",
          transactionId: "UAT-DEMO-0001",
        },
      },
    },
  });

  // ── Blog authors + posts ───────────────────────────────────────────────
  const author = await prisma.author.create({
    data: {
      username: "editor",
      name: "Store Editor",
      email: "editor@ashandmoss.com",
      password: hash,
      bio: "Content editor for Ash and Moss.",
    },
  });
  const blogCategory = await prisma.infoPageCategory.create({
    data: { categoryHandle: "blog", categoryName: "Blog" },
  });
  await prisma.blog.create({
    data: {
      title: "The Workshop Notebook: A Seat for Every Room",
      slug: "a-seat-for-every-room",
      content: "<p>From the lounge chair built for slow evenings to the bench that tucks under the dining table — how we choose which piece to build next.</p>",
      coverImage: UNSPLASH("photo-1555041469-a586c61ea9bc"),
      tags: "workshop,seating,craft",
      published: true,
      publishedAt: new Date(),
      writerId: author.id,
      blogCategoryId: blogCategory.id,
    },
  });
  console.log(`  Blog seeded: 1 post by ${author.username}`);

  // ── Info pages ─────────────────────────────────────────────────────────
  for (const [handle, name, title, body] of [
    ["pages", "Pages", "About Us", "<p>Ash and Moss is a small timber workshop. We cut, joint, oil and deliver made-to-measure furniture for homes that want it to last.</p>"],
    ["pages", "Pages", "Terms & Conditions", "<p>Our terms cover made-to-order furniture, deposits, lead times and cancellation windows. Orders are confirmed by email.</p>"],
    ["pages", "Pages", "Privacy Policy", "<p>We store only what we need to make and deliver your furniture: name, address, email and order history. We never sell your data.</p>"],
    ["pages", "Pages", "Refund Policy", "<p>Unmade orders can be cancelled within 14 days for a full refund. Delivered pieces can be returned within 7 days if damaged in transit.</p>"],
    ["policy", "Policy", "Shipping & Delivery", "<p>We deliver nationwide. Lead time is 4–8 weeks as each piece is made to order; larger items ship via courier with white-glove handling.</p>"],
  ] as const) {
    const cat = await prisma.infoPageCategory.upsert({
      where: { categoryHandle: handle },
      update: { categoryName: name },
      create: { categoryHandle: handle, categoryName: name },
    });
    await prisma.infoPage.create({
      data: {
        title,
        slug: slugify(title),
        content: body,
        published: true,
        infoPageCategoryId: cat.id,
      },
    });
  }

  // ── Testimonials ───────────────────────────────────────────────────────
  for (const [name, content, rating] of [
    ["Sita Gurung", "The lounge chair arrived jointed to the millimetre. It's the first piece of furniture that feels like it was made for the room.", 5],
    ["Ram KC", "Ordered the dining table in walnut — six weeks later it's the centre of the house. Worth every rupee.", 5],
    ["Anisha Tamang", "Gorgeous timber and honest communication. Delivery took a week longer than hoped, but the quality forgave it.", 4],
  ] as const) {
    await prisma.testimonial.create({ data: { author: name, content, rating } });
  }

  // ── Newsletter subscribers ─────────────────────────────────────────────
  for (const email of ["subscriber1@example.com", "subscriber2@example.com"]) {
    await prisma.newsletterSubscriber.create({
      data: {
        email,
        unsubSecret: randomBytes(16).toString("hex"),
        isActive: true,
      },
    });
  }

  // ── Redirects ──────────────────────────────────────────────────────────
  await prisma.redirect.createMany({
    data: [
      { from: "/old-shop", to: "/explore", permanent: true },
      { from: "/contact-us", to: "/contact", permanent: false },
    ],
  });

  console.log("\nSeed complete.");
  console.log("  Admin login: admin@ashandmoss.com / password123");
  console.log("  Customer:    bikash@example.com / password123");
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

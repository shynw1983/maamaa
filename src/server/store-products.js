const {
  baseSoup,
  heatLevels,
  medicinalSpiceOptions,
  menuSections,
  numbLevels,
  specialFlavors,
} = require("../data/malatang-menu.ts");

let sqlClientPromise;

const store = {
  id: "shimizu",
  name: "まぁ麻 清水店",
  isPrimary: true,
};

const getSql = async () => {
  if (!process.env.DATABASE_URL) {
    return null;
  }

  if (!sqlClientPromise) {
    sqlClientPromise = import("@neondatabase/serverless").then(({ neon }) => neon(process.env.DATABASE_URL));
  }

  return sqlClientPromise;
};

const catalog = [
  { ...baseSoup, category: "soup", categoryLabel: "ベーススープ" },
  ...medicinalSpiceOptions.map((item) => ({ ...item, category: "spice", categoryLabel: "薬膳スパイス" })),
  ...heatLevels.map((item) => ({ ...item, category: "heat", categoryLabel: "辛さ" })),
  ...numbLevels.map((item) => ({ ...item, category: "numb", categoryLabel: "痺れ" })),
  ...specialFlavors.map((item) => ({ ...item, category: "flavor", categoryLabel: "味変" })),
  ...menuSections.flatMap((section) =>
    section.items.map((item) => ({
      ...item,
      category: section.id,
      categoryLabel: section.title,
    })),
  ),
];

const listStoreProducts = async (storeId = store.id) => {
  const sql = await getSql();
  const overrides = sql
    ? await sql`
        select *
        from store_products
        where store_id = ${storeId}
      `
    : [];
  const overrideMap = new Map(overrides.map((row) => [row.product_id, row]));

  return catalog.map((item) => {
    const override = overrideMap.get(item.id);
    return {
      drinkId: item.id,
      name: item.name,
      category: item.category,
      categoryLabel: item.categoryLabel,
      basePrice: item.price,
      imageUrl: "",
      isAvailable: override ? override.is_available : true,
      websiteEnabled: override ? override.website_enabled : true,
      priceOverride: override?.price_override ?? null,
      effectivePrice: override?.price_override ?? item.price,
      updatedAt: override?.updated_at || "",
    };
  });
};

const updateStoreProduct = async (storeId, drinkId, fields) => {
  const sql = await getSql();
  if (!sql) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const product = catalog.find((item) => item.id === drinkId);
  if (!product) {
    return null;
  }

  const current = (await listStoreProducts(storeId)).find((item) => item.drinkId === drinkId);
  const isAvailable = fields.isAvailable ?? current?.isAvailable ?? true;
  const websiteEnabled = fields.websiteEnabled ?? current?.websiteEnabled ?? true;
  const priceOverride =
    fields.priceOverride === null || fields.priceOverride === ""
      ? null
      : fields.priceOverride === undefined
        ? current?.priceOverride ?? null
        : Number(fields.priceOverride);

  await sql`
    insert into store_products (
      store_id,
      product_id,
      is_available,
      website_enabled,
      price_override
    ) values (
      ${storeId},
      ${drinkId},
      ${isAvailable},
      ${websiteEnabled},
      ${Number.isFinite(priceOverride) ? priceOverride : null}
    )
    on conflict (store_id, product_id)
    do update set
      is_available = excluded.is_available,
      website_enabled = excluded.website_enabled,
      price_override = excluded.price_override,
      updated_at = now()
  `;

  return (await listStoreProducts(storeId)).find((item) => item.drinkId === drinkId) || null;
};

const listActiveStores = async () => [store];

module.exports = {
  listActiveStores,
  listStoreProducts,
  updateStoreProduct,
};

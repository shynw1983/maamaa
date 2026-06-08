const localMenu = require("../data/malatang-menu.ts");

const defaultOsBaseUrl = "https://foundr1.jp";
const brandMenuRevalidateSeconds = 300;
const storeMenuRevalidateSeconds = 15;

const fallbackStoreId = () => (
  process.env.FOUNDR1_SHIMIZU_STORE_ID ||
  process.env.NEXT_PUBLIC_FOUNDR1_SHIMIZU_STORE_ID ||
  "ed6c3b1f-e68a-4cbd-92e2-06a800eb7183"
);

const cleanBaseUrl = (value = "") => String(value).trim().replace(/\/$/, "");

const normalizeMenuApiUrl = (value = "") => {
  const rawUrl = cleanBaseUrl(value);
  if (!rawUrl) return "";

  try {
    const url = new URL(rawUrl);
    const brand = String(url.searchParams.get("brand") || "").trim().toLowerCase();
    if (brand === "maamaa" || brand === "maaamaa" || brand === "maama") {
      url.searchParams.set("brand", "まぁ麻");
    }
    return url.toString();
  } catch {
    return rawUrl;
  }
};

const getMenuApiUrl = () => {
  const configured = cleanBaseUrl(
    process.env.FOUNDR1_OS_MENU_API_URL ||
    process.env.FOUNDR1_MENU_API_URL ||
    "",
  );
  if (configured) return normalizeMenuApiUrl(configured);

  const baseUrl = cleanBaseUrl(
    process.env.FOUNDR1_API_BASE_URL ||
    process.env.NEXT_PUBLIC_FOUNDR1_API_BASE_URL ||
    process.env.FOUNDR1_OS_BASE_URL ||
    defaultOsBaseUrl,
  );
  return `${baseUrl}/api/public/menus?brand=${encodeURIComponent("まぁ麻")}`;
};

const fallbackMenu = () => ({
  baseSoup: {
    ...localMenu.baseSoup,
    isAvailable: true,
    websiteEnabled: true,
  },
  medicinalSpiceOptions: localMenu.medicinalSpiceOptions,
  heatLevels: localMenu.heatLevels,
  numbLevels: localMenu.numbLevels,
  specialFlavors: localMenu.specialFlavors,
  menuSections: localMenu.menuSections,
  stores: [{ id: "shimizu", label: "まぁ麻 清水店", osStoreId: fallbackStoreId() }],
  selectedStoreId: "shimizu",
  storeOperation: {
    reservationsEnabled: true,
    statusNote: "",
    businessHours: {},
    reservationNote: "",
    minimumPickupMinutes: 15,
  },
  source: "local-fallback",
});

const asChoice = (item) => ({
  id: String(item?.id || item?.optionKey || item?.externalId || "").trim(),
  name: String(item?.name || item?.label || "").trim(),
  displayNames: item?.displayNames || {},
  price: Number(item?.price || 0),
  note: item?.note ? String(item.note) : undefined,
});

const asChoices = (items) => (Array.isArray(items) ? items.map(asChoice).filter((item) => item.id && item.name) : []);
const optionGroupByKey = (groups, key) => groups.find((group) => group.groupKey === key);
const choicesForGroup = (groups, key) => asChoices(optionGroupByKey(groups, key)?.options);
const normalizeStandardMenu = (payload) => {
  if (!Array.isArray(payload?.items) || !payload.items.length || !Array.isArray(payload.optionGroups)) return null;
  const baseItem = payload.items.find((item) => item.itemKind === "buildable_product") || payload.items[0];
  if (!baseItem) return null;
  const groups = payload.optionGroups;
  const fixedGroupKeys = new Set(["medicinal-spice", "heat", "numb", "special-flavor"]);
  const menuSections = groups
    .filter((group) => !fixedGroupKeys.has(group.groupKey))
    .map((group) => ({
      id: String(group.groupKey || group.id || "").trim(),
      title: String(group.name || "").trim(),
      displayNames: group.displayNames || {},
      limit: Math.max(1, Number(group.ruleJson?.limit || 99)),
      items: asChoices(group.options),
    }))
    .filter((section) => section.id && section.title && section.items.length);

  return {
    ...fallbackMenu(),
    source: "foundr1-os",
    baseSoup: {
      ...fallbackMenu().baseSoup,
      id: String(baseItem.externalId || baseItem.id || "mala-soup"),
      menuCatalogItemId: String(baseItem.id || ""),
      name: String(baseItem.name || localMenu.baseSoup.name),
      displayNames: baseItem.displayNames || {},
      price: Number(baseItem.priceOverride ?? baseItem.basePrice ?? localMenu.baseSoup.price),
      note: String(baseItem.description || localMenu.baseSoup.note || ""),
      isAvailable: baseItem.isAvailable !== false,
      websiteEnabled: baseItem.websiteEnabled !== false,
    },
    medicinalSpiceOptions: choicesForGroup(groups, "medicinal-spice"),
    heatLevels: choicesForGroup(groups, "heat"),
    numbLevels: choicesForGroup(groups, "numb"),
    specialFlavors: choicesForGroup(groups, "special-flavor"),
    menuSections,
    stores: Array.isArray(payload.stores) && payload.stores.length ? payload.stores : fallbackMenu().stores,
    selectedStoreId: payload.selectedStoreId || fallbackMenu().selectedStoreId,
    storeOperation: {
      ...fallbackMenu().storeOperation,
      ...(payload.storeOperation || {}),
    },
  };
};

const normalizeOsMenu = (payload) => {
  const standardMenu = normalizeStandardMenu(payload);
  if (standardMenu) return standardMenu;

  const menu = payload?.baseMenu || payload;
  if (!menu?.baseSoup || !Array.isArray(menu.menuSections)) return null;
  const rawMinimumPickupMinutes = menu.storeOperation?.minimumPickupMinutes;
  const hasConfiguredMinimumPickupMinutes = rawMinimumPickupMinutes !== null && rawMinimumPickupMinutes !== undefined && rawMinimumPickupMinutes !== "";

  const normalized = {
    ...fallbackMenu(),
    ...menu,
    source: "foundr1-os",
    baseSoup: {
      ...fallbackMenu().baseSoup,
      ...menu.baseSoup,
      id: String(menu.baseSoup.id || "mala-soup"),
      name: String(menu.baseSoup.name || localMenu.baseSoup.name),
      price: Number(menu.baseSoup.price ?? localMenu.baseSoup.price),
      note: String(menu.baseSoup.note || localMenu.baseSoup.note || ""),
      isAvailable: menu.baseSoup.isAvailable !== false,
      websiteEnabled: menu.baseSoup.websiteEnabled !== false,
    },
    medicinalSpiceOptions: asChoices(menu.medicinalSpiceOptions),
    heatLevels: asChoices(menu.heatLevels),
    numbLevels: asChoices(menu.numbLevels),
    specialFlavors: asChoices(menu.specialFlavors),
    menuSections: menu.menuSections
      .map((section) => ({
        id: String(section?.id || "").trim(),
        title: String(section?.title || "").trim(),
        limit: Math.max(1, Number(section?.limit || 99)),
        items: asChoices(section?.items),
      }))
      .filter((section) => section.id && section.title),
    stores: Array.isArray(menu.stores) && menu.stores.length ? menu.stores : fallbackMenu().stores,
    selectedStoreId: menu.selectedStoreId || fallbackMenu().selectedStoreId,
    storeOperation: {
      ...fallbackMenu().storeOperation,
      ...(menu.storeOperation || {}),
      minimumPickupMinutes: hasConfiguredMinimumPickupMinutes && Number.isFinite(Number(rawMinimumPickupMinutes))
        ? Math.max(0, Math.min(240, Math.round(Number(rawMinimumPickupMinutes))))
        : fallbackMenu().storeOperation.minimumPickupMinutes,
    },
  };

  if (!normalized.medicinalSpiceOptions.length) normalized.medicinalSpiceOptions = localMenu.medicinalSpiceOptions;
  if (!normalized.heatLevels.length) normalized.heatLevels = localMenu.heatLevels;
  if (!normalized.numbLevels.length) normalized.numbLevels = localMenu.numbLevels;
  if (!normalized.menuSections.length) normalized.menuSections = localMenu.menuSections;
  return normalized;
};

const resolveStoreQuery = (store = "") => {
  const value = String(store || "").trim();
  if (!value || value === "shimizu") return fallbackStoreId();
  return value;
};

const fetchOsMenu = async (store = "", options = {}) => {
  const baseUrl = getMenuApiUrl();
  if (!baseUrl || baseUrl === "off") return null;

  try {
    const url = new URL(baseUrl);
    const storeQuery = resolveStoreQuery(store);
    if (storeQuery) url.searchParams.set("store", storeQuery);

    const headers = { Accept: "application/json" };
    if (process.env.FOUNDR1_OS_MENU_API_BYPASS_SECRET) {
      headers["x-vercel-protection-bypass"] = process.env.FOUNDR1_OS_MENU_API_BYPASS_SECRET;
    }

    const fetchOptions = {
      headers,
      next: { revalidate: storeQuery ? storeMenuRevalidateSeconds : brandMenuRevalidateSeconds },
    };
    if (options.noStore) {
      delete fetchOptions.next;
      fetchOptions.cache = "no-store";
      url.searchParams.set("_", String(Date.now()));
    }

    const response = await fetch(url.toString(), fetchOptions);
    if (!response.ok) throw new Error(`Foundr1 OS menu returned ${response.status}`);
    return normalizeOsMenu(await response.json());
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getMenuData = async (store = "", options = {}) => (await fetchOsMenu(store, options)) || fallbackMenu();

module.exports = {
  fallbackMenu,
  getMenuData,
};

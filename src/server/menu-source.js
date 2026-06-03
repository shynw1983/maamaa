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

const getMenuApiUrl = () => {
  const configured = cleanBaseUrl(
    process.env.FOUNDR1_OS_MENU_API_URL ||
    process.env.FOUNDR1_MENU_API_URL ||
    "",
  );
  if (configured) return configured;

  const baseUrl = cleanBaseUrl(
    process.env.FOUNDR1_API_BASE_URL ||
    process.env.NEXT_PUBLIC_FOUNDR1_API_BASE_URL ||
    process.env.FOUNDR1_OS_BASE_URL ||
    defaultOsBaseUrl,
  );
  return `${baseUrl}/api/public/menus/maamaa-compatible`;
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
  id: String(item?.id || "").trim(),
  name: String(item?.name || item?.label || "").trim(),
  price: Number(item?.price || 0),
  note: item?.note ? String(item.note) : undefined,
});

const asChoices = (items) => (Array.isArray(items) ? items.map(asChoice).filter((item) => item.id && item.name) : []);

const normalizeOsMenu = (payload) => {
  const menu = payload?.baseMenu || payload;
  if (!menu?.baseSoup || !Array.isArray(menu.menuSections)) return null;

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
      minimumPickupMinutes: Number.isFinite(Number(menu.storeOperation?.minimumPickupMinutes))
        ? Math.max(0, Math.min(240, Math.round(Number(menu.storeOperation.minimumPickupMinutes))))
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

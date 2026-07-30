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

const getFoundr1BaseUrl = () => cleanBaseUrl(
  process.env.FOUNDR1_API_BASE_URL ||
  process.env.NEXT_PUBLIC_FOUNDR1_API_BASE_URL ||
  process.env.FOUNDR1_OS_BASE_URL ||
  defaultOsBaseUrl,
);

const getMenuApiUrl = () => {
  const configured = cleanBaseUrl(
    process.env.FOUNDR1_OS_MENU_API_URL ||
    process.env.FOUNDR1_MENU_API_URL ||
    "",
  );
  if (configured) return normalizeMenuApiUrl(configured);

  return `${getFoundr1BaseUrl()}/api/public/menus?brand=${encodeURIComponent("まぁ麻")}`;
};

const getBrandStoresApiUrl = () => `${getFoundr1BaseUrl()}/api/public/menus/maamaa-compatible`;

const fallbackMenu = () => ({
  baseSoup: {
    ...localMenu.baseSoup,
    isAvailable: true,
    websiteEnabled: true,
  },
  medicinalSpiceGroup: {
    id: "medicinal-spice",
    name: "薬膳スパイス",
    displayNames: {},
  },
  medicinalSpiceOptions: localMenu.medicinalSpiceOptions,
  heatGroup: {
    id: "heat",
    name: "辛さ",
    displayNames: {},
  },
  heatLevels: localMenu.heatLevels,
  numbGroup: {
    id: "numb",
    name: "痺れ",
    displayNames: {},
  },
  numbLevels: localMenu.numbLevels,
  specialFlavorGroup: {
    id: "special-flavor",
    name: "味変・追加調味",
    displayNames: {},
  },
  specialFlavors: localMenu.specialFlavors,
  presetSoups: localMenu.presetSoups,
  noodleReplacementOptions: localMenu.noodleReplacementOptions,
  menuSections: localMenu.menuSections,
  stores: [{ id: "shimizu", label: "まぁ麻", osStoreId: fallbackStoreId() }],
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

const resolveMenuStoreDisplayName = (menu = null) => {
  const stores = Array.isArray(menu?.stores) ? menu.stores : [];
  const selectedStoreId = String(menu?.selectedStoreId || "").trim();
  const selectedStore = stores.find((store) => (
    String(store?.id || "").trim() === selectedStoreId ||
    String(store?.osStoreId || "").trim() === selectedStoreId
  )) || stores[0];

  return String(
    selectedStore?.customerDisplayName ||
    selectedStore?.displayName ||
    selectedStore?.publicName ||
    selectedStore?.customerDisplayNames?.defaultName ||
    selectedStore?.label ||
    selectedStore?.name ||
    fallbackMenu().stores[0].label,
  ).trim();
};

const menuPrice = (item, fallback = 0) => {
  const value = item?.price ?? item?.priceDelta ?? item?.price_delta ?? item?.basePrice ?? item?.base_price ?? fallback;
  const price = Number(value);
  return Number.isFinite(price) ? price : Number(fallback) || 0;
};

const websitePresentation = (item = {}) => {
  const value = item?.variableSchema?.websitePresentation || {};
  return {
    name: String(value.nameOverride || item?.name || item?.label || "").trim(),
    promotionPrefix: String(value.promotionPrefixOverride || item?.promotionPrefix || "").trim(),
    category: String(value.categoryOverride || item?.category || "").trim(),
    showPromotionPrefix: value.showPromotionPrefix === undefined
      ? item?.showPromotionPrefix !== false
      : value.showPromotionPrefix !== false,
    showEmoji: value.showEmoji === undefined
      ? item?.showEmoji !== false
      : value.showEmoji !== false,
  };
};

const asChoice = (item) => {
  const presentation = websitePresentation(item);
  return {
    id: String(item?.optionKey || item?.externalId || item?.id || "").trim(),
    menuOptionId: String(item?.id || "").trim(),
    name: presentation.name,
    displayNames: item?.displayNames || {},
    promotionPrefix: presentation.promotionPrefix,
    promotionPrefixDisplayNames: item?.promotionPrefixDisplayNames || {},
    showPromotionPrefix: presentation.showPromotionPrefix,
    showEmoji: presentation.showEmoji,
    price: menuPrice(item),
    note: item?.note ? String(item.note) : undefined,
  };
};

const asChoices = (items) => (Array.isArray(items) ? items.map(asChoice).filter((item) => item.id && item.name) : []);
const optionGroupByKey = (groups, key) => groups.find((group) => group.groupKey === key);
const asGroupLabel = (group, fallbackName) => ({
  id: String(group?.groupKey || group?.id || "").trim(),
  name: String(group?.name || fallbackName || "").trim(),
  displayNames: group?.displayNames || {},
});
const choicesForGroup = (groups, key) => asChoices(optionGroupByKey(groups, key)?.options);
const normalizeStandardMenu = (payload) => {
  if (!Array.isArray(payload?.items) || !payload.items.length || !Array.isArray(payload.optionGroups)) return null;
  const baseItem = payload.items.find((item) => item.itemKind === "buildable_product") || payload.items[0];
  if (!baseItem) return null;
  const groups = Array.isArray(baseItem.optionGroups)
    ? baseItem.optionGroups
    : Array.isArray(payload.optionGroups)
      ? payload.optionGroups
      : [];
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

  const medicinalSpiceGroup = optionGroupByKey(groups, "medicinal-spice");
  const heatGroup = optionGroupByKey(groups, "heat");
  const numbGroup = optionGroupByKey(groups, "numb");
  const specialFlavorGroup = optionGroupByKey(groups, "special-flavor");
  const presetSoups = Array.isArray(baseItem.variableSchema?.presetSoups)
    ? baseItem.variableSchema.presetSoups
    : localMenu.presetSoups;
  const presetCatalogByExternalId = new Map(
    payload.items
      .filter((item) => item.itemKind === "fixed_product" && item.variableSchema?.preset === true)
      .map((item) => [String(item.externalId || ""), item]),
  );
  const noodleReplacementOptions = Array.isArray(baseItem.variableSchema?.noodleReplacementOptions)
    ? baseItem.variableSchema.noodleReplacementOptions
    : localMenu.noodleReplacementOptions;

  return {
    ...fallbackMenu(),
    source: "foundr1-os",
    baseSoup: {
      ...fallbackMenu().baseSoup,
      ...asChoice(baseItem),
      id: String(baseItem.externalId || baseItem.id || "mala-soup"),
      menuCatalogItemId: String(baseItem.id || ""),
      price: menuPrice(baseItem, localMenu.baseSoup.price),
      note: String(baseItem.description || localMenu.baseSoup.note || ""),
      noteDisplayNames: baseItem.descriptionDisplayNames || {},
      isAvailable: baseItem.storeSetting?.isAvailable !== false,
      websiteEnabled: baseItem.storeSetting?.websiteEnabled !== false,
    },
    medicinalSpiceGroup: asGroupLabel(medicinalSpiceGroup, "薬膳スパイス"),
    medicinalSpiceOptions: asChoices(medicinalSpiceGroup?.options),
    heatGroup: asGroupLabel(heatGroup, "辛さ"),
    heatLevels: asChoices(heatGroup?.options),
    numbGroup: asGroupLabel(numbGroup, "痺れ"),
    numbLevels: asChoices(numbGroup?.options),
    specialFlavorGroup: asGroupLabel(specialFlavorGroup, "味変・追加調味"),
    specialFlavors: asChoices(specialFlavorGroup?.options),
    presetSoups: asChoices(presetSoups).map((item, index) => {
      const catalogItem = presetCatalogByExternalId.get(item.id);
      const presentedItem = catalogItem ? asChoice(catalogItem) : item;
      const presentation = catalogItem ? websitePresentation(catalogItem) : {};
      return {
        ...item,
        ...presentedItem,
        id: item.id,
        menuCatalogItemId: String(catalogItem?.id || ""),
        category: presentation.category || presetSoups[index]?.category || "recommended-set",
        defaultNoodle: String(presetSoups[index]?.defaultNoodle || "板春雨"),
        note: String(presetSoups[index]?.note || catalogItem?.description || ""),
        isAvailable: catalogItem?.storeSetting?.isAvailable !== false,
        websiteEnabled: catalogItem?.storeSetting?.websiteEnabled !== false,
      };
    }),
    noodleReplacementOptions: asChoices(noodleReplacementOptions),
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
      displayNames: menu.baseSoup.displayNames || {},
      promotionPrefix: String(menu.baseSoup.promotionPrefix || ""),
      promotionPrefixDisplayNames: menu.baseSoup.promotionPrefixDisplayNames || {},
      showPromotionPrefix: menu.baseSoup.showPromotionPrefix !== false,
      showEmoji: menu.baseSoup.showEmoji !== false,
      price: menuPrice(menu.baseSoup, localMenu.baseSoup.price),
      note: String(menu.baseSoup.note || localMenu.baseSoup.note || ""),
      noteDisplayNames: menu.baseSoup.noteDisplayNames || menu.baseSoup.descriptionDisplayNames || {},
      isAvailable: menu.baseSoup.isAvailable !== false,
      websiteEnabled: menu.baseSoup.websiteEnabled !== false,
    },
    medicinalSpiceOptions: asChoices(menu.medicinalSpiceOptions),
    heatLevels: asChoices(menu.heatLevels),
    numbLevels: asChoices(menu.numbLevels),
    specialFlavors: asChoices(menu.specialFlavors),
    presetSoups: asChoices(menu.presetSoups).map((item, index) => ({
      ...item,
      menuCatalogItemId: String(menu.presetSoups?.[index]?.menuCatalogItemId || ""),
      category: menu.presetSoups?.[index]?.category || "recommended-set",
      defaultNoodle: String(menu.presetSoups?.[index]?.defaultNoodle || "板春雨"),
      note: String(menu.presetSoups?.[index]?.note || ""),
      promotionPrefix: String(menu.presetSoups?.[index]?.promotionPrefix || ""),
      promotionPrefixDisplayNames: menu.presetSoups?.[index]?.promotionPrefixDisplayNames || {},
      showPromotionPrefix: menu.presetSoups?.[index]?.showPromotionPrefix !== false,
      showEmoji: menu.presetSoups?.[index]?.showEmoji !== false,
      isAvailable: menu.presetSoups?.[index]?.isAvailable !== false,
      websiteEnabled: menu.presetSoups?.[index]?.websiteEnabled !== false,
    })),
    noodleReplacementOptions: asChoices(menu.noodleReplacementOptions),
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
  if (!normalized.presetSoups.length) normalized.presetSoups = localMenu.presetSoups;
  if (!normalized.noodleReplacementOptions.length) normalized.noodleReplacementOptions = localMenu.noodleReplacementOptions;
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

const getBrandStores = async (options = {}) => {
  try {
    const headers = { Accept: "application/json" };
    if (process.env.FOUNDR1_OS_MENU_API_BYPASS_SECRET) {
      headers["x-vercel-protection-bypass"] = process.env.FOUNDR1_OS_MENU_API_BYPASS_SECRET;
    }

    const fetchOptions = {
      headers,
      next: { revalidate: brandMenuRevalidateSeconds },
    };
    if (options.noStore) {
      delete fetchOptions.next;
      fetchOptions.cache = "no-store";
    }

    const response = await fetch(getBrandStoresApiUrl(), fetchOptions);
    if (!response.ok) throw new Error(`Foundr1 OS brand stores returned ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload?.stores) && payload.stores.length ? payload.stores : fallbackMenu().stores;
  } catch (error) {
    console.error(error);
    return fallbackMenu().stores;
  }
};

module.exports = {
  fallbackMenu,
  getBrandStores,
  getMenuData,
  resolveMenuStoreDisplayName,
};

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
  // Preset products are store-controlled in Foundr1 OS. Fail closed during an API outage
  // so a locally bundled preset cannot reappear after being set to Web非表示.
  presetSoups: [],
  menuCategories: localMenu.menuCategories,
  noodleReplacementOptions: localMenu.noodleReplacementOptions,
  noodleReplacementRule: localMenu.noodleReplacementRule,
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
    description: String(value.descriptionOverride || item?.description || "").trim(),
    descriptionDisplayNames:
      value.descriptionDisplayNamesOverride &&
      typeof value.descriptionDisplayNamesOverride === "object" &&
      !Array.isArray(value.descriptionDisplayNamesOverride)
        ? value.descriptionDisplayNamesOverride
        : item?.descriptionDisplayNames || {},
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
    imageUrl: String(item?.imageUrl || "").trim(),
    displayNames: item?.displayNames || {},
    promotionPrefix: presentation.promotionPrefix,
    promotionPrefixDisplayNames: item?.promotionPrefixDisplayNames || {},
    showPromotionPrefix: presentation.showPromotionPrefix,
    showEmoji: presentation.showEmoji,
    price: menuPrice(item),
    note: item?.note ? String(item.note) : undefined,
    category: String(item?.variableSchema?.categoryKey || item?.category || "").trim(),
    customizationGroupKeys: Array.isArray(item?.customizationGroups)
      ? item.customizationGroups.map((group) => String(group?.groupKey || "").trim()).filter(Boolean)
      : Array.isArray(item?.variableSchema?.customizationGroupKeys)
        ? item.variableSchema.customizationGroupKeys.map(String)
        : [],
    minimumOrderAmount: Math.max(0, Number(item?.variableSchema?.minimumOrderAmount ?? 800) || 0),
    isAvailable: item?.storeSetting?.isAvailable !== false,
    websiteEnabled: item?.storeSetting?.websiteEnabled !== false && item?.variableSchema?.websiteEnabled !== false,
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
  const groups = Array.isArray(payload.optionGroups) ? payload.optionGroups : [];
  const fixedGroupKeys = new Set(["medicinal-spice", "heat", "numb", "special-flavor", "noodle-replacement"]);
  const menuSections = groups
    .filter((group) => !fixedGroupKeys.has(group.groupKey))
    .map((group) => ({
      id: String(group.groupKey || group.id || "").trim(),
      title: String(group.name || "").trim(),
      displayNames: group.displayNames || {},
      limit: Math.max(1, Number(group.ruleJson?.maxSelections ?? group.ruleJson?.limit ?? 99)),
      perOptionMax: Math.max(1, Number(group.ruleJson?.perOptionMax ?? group.ruleJson?.maxSelections ?? group.ruleJson?.limit ?? 99)),
      items: asChoices(group.options),
    }))
    .filter((section) => section.id && section.title && section.items.length);

  const medicinalSpiceGroup = optionGroupByKey(groups, "medicinal-spice");
  const heatGroup = optionGroupByKey(groups, "heat");
  const numbGroup = optionGroupByKey(groups, "numb");
  const specialFlavorGroup = optionGroupByKey(groups, "special-flavor");
  const noodleReplacementGroup = optionGroupByKey(groups, "noodle-replacement");
  const catalogProducts = payload.items.filter((item) => (
    item.id !== baseItem.id &&
    item.itemKind !== "information" &&
    item.storeSetting?.websiteEnabled !== false &&
    item.variableSchema?.websiteEnabled !== false
  ));
  const categoryKeyByName = new Map(
    payload.items
      .map((item) => [String(item.category || "").trim(), String(item.variableSchema?.categoryKey || "").trim()])
      .filter(([name, key]) => name && key),
  );
  const noodleReplacementOptions = noodleReplacementGroup?.options?.length
    ? noodleReplacementGroup.options
    : localMenu.noodleReplacementOptions;
  const noodleReplacementRule = {
    limit: Math.max(1, Number(noodleReplacementGroup?.ruleJson?.maxSelections ?? noodleReplacementGroup?.ruleJson?.limit ?? localMenu.noodleReplacementRule.limit)),
    perOptionMax: Math.max(1, Number(noodleReplacementGroup?.ruleJson?.perOptionMax ?? localMenu.noodleReplacementRule.perOptionMax)),
  };
  const basePresentation = websitePresentation(baseItem);

  return {
    ...fallbackMenu(),
    source: "foundr1-os",
    baseSoup: {
      ...fallbackMenu().baseSoup,
      ...asChoice(baseItem),
      id: String(baseItem.externalId || baseItem.id || "mala-soup"),
      menuCatalogItemId: String(baseItem.id || ""),
      price: menuPrice(baseItem, localMenu.baseSoup.price),
      note: String(basePresentation.description || localMenu.baseSoup.note || ""),
      noteDisplayNames: basePresentation.descriptionDisplayNames,
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
    presetSoups: catalogProducts.map((catalogItem) => {
      const presentedItem = asChoice(catalogItem);
      const presentation = websitePresentation(catalogItem);
      return {
        ...presentedItem,
        id: String(catalogItem.externalId || catalogItem.id || ""),
        menuCatalogItemId: String(catalogItem?.id || ""),
        category: String(catalogItem.variableSchema?.categoryKey || presentation.category || catalogItem.category || "recommended-set"),
        defaultNoodle: String(catalogItem.variableSchema?.defaultNoodle || "板春雨"),
        note: String(presentation.description || catalogItem.description || ""),
        noteDisplayNames: presentation.descriptionDisplayNames || {},
        isAvailable: catalogItem?.storeSetting?.isAvailable !== false,
        websiteEnabled: catalogItem?.storeSetting?.websiteEnabled !== false && catalogItem.variableSchema?.websiteEnabled !== false,
      };
    }),
    menuCategories: (Array.isArray(payload.categories) ? payload.categories : [])
      .map((category) => ({
        id: categoryKeyByName.get(String(category.name || "").trim()) || String(category.externalId || category.id || ""),
        name: String(category.name || "").trim(),
        sortOrder: Number(category.sortOrder || 100),
      }))
      .filter((category) => category.id && category.name),
    noodleReplacementOptions: asChoices(noodleReplacementOptions),
    noodleReplacementRule,
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
    presetSoups: asChoices(menu.presetSoups)
      .map((item, index) => ({
        ...item,
        menuCatalogItemId: String(menu.presetSoups?.[index]?.menuCatalogItemId || ""),
        category: menu.presetSoups?.[index]?.category || "recommended-set",
        defaultNoodle: String(menu.presetSoups?.[index]?.defaultNoodle || "板春雨"),
        note: String(menu.presetSoups?.[index]?.note || ""),
        noteDisplayNames: menu.presetSoups?.[index]?.noteDisplayNames || {},
        promotionPrefix: String(menu.presetSoups?.[index]?.promotionPrefix || ""),
        promotionPrefixDisplayNames: menu.presetSoups?.[index]?.promotionPrefixDisplayNames || {},
        showPromotionPrefix: menu.presetSoups?.[index]?.showPromotionPrefix !== false,
        showEmoji: menu.presetSoups?.[index]?.showEmoji !== false,
        isAvailable: menu.presetSoups?.[index]?.isAvailable !== false,
        websiteEnabled: menu.presetSoups?.[index]?.websiteEnabled !== false,
      }))
      .filter((item) => item.websiteEnabled !== false),
    noodleReplacementOptions: asChoices(menu.noodleReplacementOptions),
    noodleReplacementRule: {
      limit: Math.max(1, Number(menu.noodleReplacementRule?.limit || localMenu.noodleReplacementRule.limit)),
      perOptionMax: Math.max(1, Number(menu.noodleReplacementRule?.perOptionMax || localMenu.noodleReplacementRule.perOptionMax)),
    },
    menuSections: menu.menuSections
      .map((section) => ({
        id: String(section?.id || "").trim(),
        title: String(section?.title || "").trim(),
        limit: Math.max(1, Number(section?.limit || 99)),
        perOptionMax: Math.max(1, Number(section?.perOptionMax || section?.limit || 99)),
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

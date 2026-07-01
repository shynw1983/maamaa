export type StoreDisplayMenu = {
  selectedStoreId?: string;
  stores?: Array<{
    id?: string;
    label?: string;
    name?: string;
    displayName?: string;
    publicName?: string;
    customerDisplayName?: string;
    customerDisplayNames?: {
      defaultName?: string;
    };
    osStoreId?: string;
  }>;
};

const fallbackStoreDisplayName = "まぁ麻";

export function resolveMenuStoreDisplayName(menu?: StoreDisplayMenu | null) {
  const stores = Array.isArray(menu?.stores) ? menu.stores : [];
  const selectedStoreId = String(menu?.selectedStoreId || "").trim();
  const selectedStore = stores.find((store) => (
    String(store.id || "").trim() === selectedStoreId ||
    String(store.osStoreId || "").trim() === selectedStoreId
  )) || stores[0];

  return String(
    selectedStore?.customerDisplayName ||
    selectedStore?.displayName ||
    selectedStore?.publicName ||
    selectedStore?.customerDisplayNames?.defaultName ||
    selectedStore?.label ||
    selectedStore?.name ||
    fallbackStoreDisplayName,
  ).trim();
}

export function formatStoreNameTemplate(template: string, storeName: string) {
  return template.split("{storeName}").join(storeName);
}

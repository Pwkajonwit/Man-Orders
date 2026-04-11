import { NetworkStore } from "@/types";

export function getStoreMapLink(store: NetworkStore) {
  if (store.mapUrl?.trim()) return store.mapUrl.trim();
  if (store.location?.trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      store.location,
    )}`;
  }
  return "";
}

export function getStorePhoneLink(store: NetworkStore) {
  if (!store.phone?.trim()) return "";
  return `tel:${store.phone.trim().replace(/\s+/g, "")}`;
}

export function getStoreOrderSeed(store: NetworkStore) {
  return {
    storeId: store.id,
    storeName: store.name,
    contact: store.phone || "",
    location: store.location || "",
  };
}


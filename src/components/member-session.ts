"use client";

export type MemberProfile = {
  id?: string;
  memberNumber?: string;
  publicToken?: string;
  preferredLanguage?: string;
  language?: string;
  selectedLanguage?: string;
  displayName?: string;
  lastName?: string;
  firstName?: string;
  fullName?: string;
  phone?: string;
  email?: string;
  pointBalance?: number;
  coupons?: Array<{
    id: string;
    couponCode?: string;
    name: string;
    discountType: string;
    discountValue: number;
    maxDiscountAmount?: number | null;
    expiresAt?: string;
  }>;
};

const memberStorageKey = "foundr1-member-profile";
const memberSessionVersionKey = "maamaa-member-session-version";
const memberSessionVersion = "20260702-contact-privacy";
const languageStorageKey = "maamaa-language";
const reservationDraftStorageKey = "maamaa-shimizu-menu-draft-v2";
const memberSignedOutStorageKey = "maamaa-member-signed-out-at";
const memberPortalUrl = process.env.NEXT_PUBLIC_FOUNDR1_MEMBER_URL || "https://foundr1.jp/member";
const memberBrand = "maamaa";
const recentSignOutMs = 5 * 60 * 1000;
const supportedLanguages = ["ja", "en", "zh", "zh-Hant", "ko", "vi", "ne"] as const;
type SupportedLanguage = typeof supportedLanguages[number];

export function normalizeMemberLanguage(value: unknown): SupportedLanguage | "" {
  const language = String(value || "").trim();
  return supportedLanguages.includes(language as SupportedLanguage) ? language as SupportedLanguage : "";
}

export function memberPreferredLanguage(profile: MemberProfile | null | undefined) {
  return normalizeMemberLanguage(profile?.preferredLanguage || profile?.language || profile?.selectedLanguage);
}

function currentLanguage() {
  if (typeof window === "undefined") return "ja";
  try {
    const stored = normalizeMemberLanguage(window.localStorage.getItem(languageStorageKey));
    if (stored) return stored;
  } catch {
    // Fall back below.
  }
  return normalizeMemberLanguage(document.documentElement.lang) || "ja";
}

function cleanReturnUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("memberHandoff");
  url.searchParams.delete("memberSignedOut");
  return url.toString();
}

function clearReservationDraftContact() {
  try {
    const rawDraft = window.sessionStorage.getItem(reservationDraftStorageKey);
    if (!rawDraft) return;
    const draft = JSON.parse(rawDraft) as Record<string, unknown>;
    delete draft.name;
    delete draft.phone;
    window.sessionStorage.setItem(reservationDraftStorageKey, JSON.stringify(draft));
  } catch {
    window.sessionStorage.removeItem(reservationDraftStorageKey);
  }
}

function markMemberSignedOut() {
  window.sessionStorage.setItem(memberSignedOutStorageKey, String(Date.now()));
  window.localStorage.setItem(memberSignedOutStorageKey, String(Date.now()));
}

export function hasRecentMemberSignOut() {
  if (typeof window === "undefined") return false;
  try {
    const signedOutAt = Math.max(
      Number(window.sessionStorage.getItem(memberSignedOutStorageKey) || 0),
      Number(window.localStorage.getItem(memberSignedOutStorageKey) || 0),
    );
    return signedOutAt > 0 && Date.now() - signedOutAt < recentSignOutMs;
  } catch {
    return false;
  }
}

function buildMemberUrl({ handoff }: { handoff: boolean }) {
  if (typeof window === "undefined") return memberPortalUrl;
  const url = new URL(memberPortalUrl);
  url.searchParams.set("returnTo", cleanReturnUrl());
  url.searchParams.set("lang", currentLanguage());
  if (handoff) url.searchParams.set("handoff", "1");
  return url.toString();
}

export function buildMemberCardUrl() {
  return buildMemberUrl({ handoff: false });
}

export function buildMemberHandoffUrl() {
  return buildMemberUrl({ handoff: true });
}

export function getStoredMemberProfile(): MemberProfile | null {
  if (typeof window === "undefined") return null;
  try {
    if (hasRecentMemberSignOut() || window.localStorage.getItem(memberSessionVersionKey) !== memberSessionVersion) {
      window.localStorage.removeItem(memberStorageKey);
      return null;
    }
    const raw = window.localStorage.getItem(memberStorageKey);
    return raw ? JSON.parse(raw) as MemberProfile : null;
  } catch {
    return null;
  }
}

async function refreshStoredMemberProfile(profile: MemberProfile | null) {
  if (!profile?.publicToken) return profile;
  try {
    const response = await fetch(`/api/member-handoff?memberToken=${encodeURIComponent(profile.publicToken)}&brand=${encodeURIComponent(memberBrand)}`, {
      cache: "no-store"
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body?.member) {
      window.localStorage.removeItem(memberStorageKey);
      window.localStorage.removeItem(memberSessionVersionKey);
      clearReservationDraftContact();
      return null;
    }
    const nextProfile = { ...body.member, coupons: Array.isArray(body.coupons) ? body.coupons : [] };
    window.localStorage.setItem(memberStorageKey, JSON.stringify(nextProfile));
    window.localStorage.setItem(memberSessionVersionKey, memberSessionVersion);
    return nextProfile as MemberProfile;
  } catch {
    return profile;
  }
}

export async function consumeMemberHandoff() {
  if (typeof window === "undefined") return getStoredMemberProfile();

  const url = new URL(window.location.href);
  if (url.searchParams.get("memberSignedOut") === "1") {
    window.localStorage.removeItem(memberStorageKey);
    window.localStorage.removeItem(memberSessionVersionKey);
    clearReservationDraftContact();
    markMemberSignedOut();
    url.searchParams.delete("memberSignedOut");
    window.history.replaceState({}, "", url.toString());
    return null;
  }

  const token = url.searchParams.get("memberHandoff");
  if (!token) return refreshStoredMemberProfile(getStoredMemberProfile());

  const response = await fetch(`/api/member-handoff?token=${encodeURIComponent(token)}&brand=${encodeURIComponent(memberBrand)}`, {
    cache: "no-store"
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.member) throw new Error(body?.error || "会員情報を読み込めませんでした。");

  const profile = { ...body.member, coupons: Array.isArray(body.coupons) ? body.coupons : [] };
  window.localStorage.setItem(memberStorageKey, JSON.stringify(profile));
  window.localStorage.setItem(memberSessionVersionKey, memberSessionVersion);
  window.sessionStorage.removeItem(memberSignedOutStorageKey);
  window.localStorage.removeItem(memberSignedOutStorageKey);
  url.searchParams.delete("memberHandoff");
  window.history.replaceState({}, "", url.toString());
  return profile as MemberProfile;
}

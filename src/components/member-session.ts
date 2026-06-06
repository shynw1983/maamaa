"use client";

export type MemberProfile = {
  id?: string;
  memberNumber?: string;
  publicToken?: string;
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
const memberPortalUrl = process.env.NEXT_PUBLIC_FOUNDR1_MEMBER_URL || "https://foundr1.jp/member";

function cleanReturnUrl() {
  const url = new URL(window.location.href);
  url.searchParams.delete("memberHandoff");
  url.searchParams.delete("memberSignedOut");
  return url.toString();
}

function buildMemberUrl({ handoff }: { handoff: boolean }) {
  if (typeof window === "undefined") return memberPortalUrl;
  const url = new URL(memberPortalUrl);
  url.searchParams.set("returnTo", cleanReturnUrl());
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
    const raw = window.localStorage.getItem(memberStorageKey);
    return raw ? JSON.parse(raw) as MemberProfile : null;
  } catch {
    return null;
  }
}

export async function consumeMemberHandoff() {
  if (typeof window === "undefined") return getStoredMemberProfile();

  const url = new URL(window.location.href);
  if (url.searchParams.get("memberSignedOut") === "1") {
    window.localStorage.removeItem(memberStorageKey);
    url.searchParams.delete("memberSignedOut");
    window.history.replaceState({}, "", url.toString());
    return null;
  }

  const token = url.searchParams.get("memberHandoff");
  if (!token) return getStoredMemberProfile();

  const response = await fetch(`/api/member-handoff?token=${encodeURIComponent(token)}`, {
    cache: "no-store"
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok || !body?.member) throw new Error(body?.error || "会員情報を読み込めませんでした。");

  const profile = { ...body.member, coupons: Array.isArray(body.coupons) ? body.coupons : [] };
  window.localStorage.setItem(memberStorageKey, JSON.stringify(profile));
  url.searchParams.delete("memberHandoff");
  window.history.replaceState({}, "", url.toString());
  return profile as MemberProfile;
}

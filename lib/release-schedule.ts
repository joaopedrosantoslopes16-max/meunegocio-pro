import type { ReleaseStage } from "@/types";

const DAY_MS = 86_400_000;

export function getReleaseStage(purchaseApprovedAt: string | null): ReleaseStage {
  if (!purchaseApprovedAt) return 0;
  const elapsed = Date.now() - new Date(purchaseApprovedAt).getTime();
  if (elapsed >= 7 * DAY_MS) return 3;
  if (elapsed >= 3 * DAY_MS) return 2;
  return 1;
}

export function getUnlockedPostCount(stage: ReleaseStage): number {
  if (stage >= 3) return 30;
  if (stage >= 2) return 13;
  return 3;
}

export function getUnlockedCaptionCount(stage: ReleaseStage): number {
  if (stage >= 3) return 30;
  if (stage >= 2) return 13;
  return 3;
}

export function getUnlockedWhatsAppCount(stage: ReleaseStage): number {
  if (stage >= 3) return 10;
  if (stage >= 2) return 8;
  return 3;
}

export function getNextUnlockDate(purchaseApprovedAt: string | null, stage: ReleaseStage): Date | null {
  if (!purchaseApprovedAt || stage >= 3) return null;
  const base = new Date(purchaseApprovedAt);
  if (stage < 2) {
    return new Date(base.getTime() + 3 * DAY_MS);
  }
  return new Date(base.getTime() + 7 * DAY_MS);
}

export function formatRelativeDate(date: Date): string {
  const diff = date.getTime() - Date.now();
  const days = Math.ceil(diff / DAY_MS);
  if (days <= 0) return "hoje";
  if (days === 1) return "amanhã";
  return `em ${days} dias`;
}

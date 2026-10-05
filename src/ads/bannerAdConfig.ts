export const TEST_BANNER_AD_GROUP_ID = "ait-ad-test-banner-id";

export function getReleaseBannerAdGroupId(configuredId?: string): string {
  if (!configuredId || !/^ait\.v2\.live\.[a-f0-9]{16}$/.test(configuredId)) {
    throw new Error("출시 광고 그룹 ID 설정이 필요합니다: FRIDGEPICK_BANNER_AD_GROUP_ID");
  }

  return configuredId;
}

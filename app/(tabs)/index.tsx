import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppHeader } from '@/components/app-header';
import { BackLink } from '@/components/back-link';
import { SelectionList } from '@/components/selection-list';
import { ScreenSection } from '@/components/screen-section';
import { SheetViewLink } from '@/components/sheet-view-link';
import { StockForm, type StockFormSubmitPayload } from '@/components/stock-form';
import { isSheetsConfigured } from '@/constants/config';
import { AppTheme } from '@/constants/app-theme';
import {
  DIRECT_ENTRY_OPTION_ID,
  countDistributorsInZone,
  getDistributorById,
  getDistributorsForPreseller,
  getPresellerById,
  getPresellersInZone,
  getSelfServiceDistributors,
  getZoneName,
  zoneHasPresellers,
  ZONES,
  type ZoneId,
} from '@/constants/distributors';
import { submitToGoogleSheet } from '@/lib/sheets';

type EntryMode = 'preseller' | 'distributor';
type Step = 'region' | 'who' | 'distributor' | 'form';

const ZONE_ICONS: Record<
  ZoneId,
  { icon: 'sunny-outline' | 'leaf-outline' | 'water-outline'; color: string; bg: string }
> = {
  eastern: { icon: 'sunny-outline', color: AppTheme.colors.eastern, bg: '#fff7ed' },
  western: { icon: 'leaf-outline', color: AppTheme.colors.western, bg: '#f5f3ff' },
  southern: { icon: 'water-outline', color: AppTheme.colors.southern, bg: '#f0f9ff' },
};

export default function HomeScreen() {
  const [step, setStep] = useState<Step>('region');
  const [zoneId, setZoneId] = useState<ZoneId | null>(null);
  const [entryMode, setEntryMode] = useState<EntryMode | null>(null);
  const [presellerId, setPresellerId] = useState<string | null>(null);
  const [distributorId, setDistributorId] = useState<string | null>(null);

  const preseller = presellerId ? getPresellerById(presellerId) : undefined;
  const distributor = distributorId ? getDistributorById(distributorId) : undefined;

  const resetAll = useCallback(() => {
    setStep('region');
    setZoneId(null);
    setEntryMode(null);
    setPresellerId(null);
    setDistributorId(null);
  }, []);

  const resetToRegion = useCallback(() => {
    setStep('region');
    setZoneId(null);
    setEntryMode(null);
    setPresellerId(null);
    setDistributorId(null);
  }, []);

  const resetToWho = useCallback(() => {
    setStep(zoneId && zoneHasPresellers(zoneId) ? 'who' : 'region');
    setEntryMode(zoneId && !zoneHasPresellers(zoneId) ? 'distributor' : null);
    setPresellerId(null);
    setDistributorId(null);
  }, [zoneId]);

  const resetToDistributor = useCallback(() => {
    setStep('distributor');
    setDistributorId(null);
  }, []);

  const handleSubmit = async (values: StockFormSubmitPayload) => {
    if (!distributor || !entryMode || !zoneId) {
      return { ok: false as const, message: 'Missing distributor or region.' };
    }

    const presellerName =
      entryMode === 'preseller' && preseller ? preseller.name : '—';

    return submitToGoogleSheet({
      entryType: entryMode,
      preseller: presellerName,
      distributor: `${distributor.name}, ${distributor.location}`,
      region: getZoneName(zoneId),
      csd: values.csd,
      kinleyWater: values.kinleyWater,
      skuDetails: values.skuDetails,
    });
  };

  const hasPsrStep = zoneId ? zoneHasPresellers(zoneId) : true;

  const stepLabels = hasPsrStep
    ? ['Region', 'Who', 'Shop', 'Stock']
    : ['Region', 'Shop', 'Stock'];

  const stepIndex = hasPsrStep
    ? step === 'region'
      ? 0
      : step === 'who'
        ? 1
        : step === 'distributor'
          ? 2
          : 3
    : step === 'region'
      ? 0
      : step === 'distributor'
        ? 1
        : 2;

  const zonePresellers = zoneId ? getPresellersInZone(zoneId) : [];

  const whoListItems = zoneId
    ? [
        ...zonePresellers.map((p) => ({
          id: p.id,
          title: p.name,
          subtitle: `${getDistributorsForPreseller(p.id, zoneId).length} distributor(s)`,
          icon: 'person-outline' as const,
          iconColor: AppTheme.colors.primary,
          iconBg: AppTheme.colors.accentSoft,
        })),
        ...(getSelfServiceDistributors(zoneId).length > 0
          ? [
              {
                id: DIRECT_ENTRY_OPTION_ID,
                title: 'I am a distributor',
                subtitle: `${getSelfServiceDistributors(zoneId).length} self-service shop(s)`,
                icon: 'storefront-outline' as const,
                iconColor: AppTheme.colors.primary,
                iconBg: AppTheme.colors.accentSoft,
              },
            ]
          : []),
      ]
    : [];

  const distributorListItems =
    zoneId && entryMode === 'preseller' && preseller
      ? getDistributorsForPreseller(preseller.id, zoneId)
      : zoneId
        ? getSelfServiceDistributors(zoneId)
        : [];

  const submittedByLabel =
    entryMode === 'preseller' && preseller ? preseller.name : 'Distributor (self)';

  const sheetWarning = !isSheetsConfigured
    ? 'Google Sheet not linked. Set EXPO_PUBLIC_GOOGLE_SHEETS_URL in deployment.env or Cloudflare env vars, then redeploy.'
    : null;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <AppHeader stepLabels={stepLabels} stepIndex={stepIndex} warning={sheetWarning} />

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {step === 'region' ? (
          <ScreenSection
            title="Select region"
            hint="Eastern uses pre-sellers. Western and Southern: pick your shop directly.">
            <SelectionList
              items={ZONES.map((z) => {
                const meta = ZONE_ICONS[z.id];
                return {
                  id: z.id,
                  title: z.name,
                  subtitle: zoneHasPresellers(z.id)
                    ? `${countDistributorsInZone(z.id)} distributors`
                    : `${countDistributorsInZone(z.id)} shops`,
                  icon: meta.icon,
                  iconColor: meta.color,
                  iconBg: meta.bg,
                };
              })}
              onSelect={(id) => {
                const zone = id as ZoneId;
                setZoneId(zone);
                if (zoneHasPresellers(zone)) {
                  setStep('who');
                } else {
                  setEntryMode('distributor');
                  setPresellerId(null);
                  setStep('distributor');
                }
              }}
            />
            <SheetViewLink />
          </ScreenSection>
        ) : null}

        {step === 'who' && zoneId && zoneHasPresellers(zoneId) ? (
          <>
            <BackLink
              label={`Change region (${getZoneName(zoneId)})`}
              onPress={resetToRegion}
            />
            <ScreenSection
              title="Who is updating?"
              hint='Pre-sellers: tap your name. Shops without a pre-seller: choose "I am a distributor".'>
              <SelectionList items={whoListItems} onSelect={(id) => {
                if (id === DIRECT_ENTRY_OPTION_ID) {
                  setEntryMode('distributor');
                  setPresellerId(null);
                  setStep('distributor');
                } else {
                  setEntryMode('preseller');
                  setPresellerId(id);
                  setStep('distributor');
                }
              }} />
            </ScreenSection>
          </>
        ) : null}

        {step === 'distributor' && entryMode && zoneId ? (
          <>
            <BackLink
              label={
                zoneHasPresellers(zoneId)
                  ? 'Back'
                  : `Change region (${getZoneName(zoneId)})`
              }
              onPress={resetToWho}
            />
            <ScreenSection
              title={
                entryMode === 'preseller'
                  ? `Select distributor`
                  : `Select your shop`
              }
              hint={
                entryMode === 'preseller' && preseller
                  ? `Pre-seller: ${preseller.name} · ${getZoneName(zoneId)}`
                  : `${getZoneName(zoneId)} region`
              }>
              <SelectionList
                items={distributorListItems.map((d) => ({
                  id: d.id,
                  title: d.name,
                  subtitle: d.location,
                  icon: 'business-outline' as const,
                  iconColor: AppTheme.colors.primaryDark,
                  iconBg: AppTheme.colors.accentSoft,
                }))}
                onSelect={(id) => {
                  setDistributorId(id);
                  setStep('form');
                }}
              />
            </ScreenSection>
          </>
        ) : null}

        {step === 'form' && distributor && entryMode && zoneId ? (
          <>
            <BackLink label="Start over" onPress={resetAll} />
            <StockForm
              key={`${zoneId}-${distributorId}`}
              submittedByLabel={submittedByLabel}
              distributorLabel={`${distributor.name}, ${distributor.location}`}
              zoneLabel={getZoneName(zoneId)}
              onSubmit={handleSubmit}
              onBack={resetToDistributor}
            />
          </>
        ) : null}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: AppTheme.colors.background,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: AppTheme.spacing.md,
    paddingBottom: AppTheme.spacing.xl,
  },
  footerSpacer: {
    height: 8,
  },
});

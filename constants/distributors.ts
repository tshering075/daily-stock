export type ZoneId = 'eastern' | 'western' | 'southern';

export type Distributor = {
  id: string;
  name: string;
  location: string;
  zone: ZoneId;
  /** null = distributor updates their own data (no pre-seller) */
  presellerId: string | null;
};

export type Preseller = {
  id: string;
  name: string;
};

export const ZONES: { id: ZoneId; name: string }[] = [
  { id: 'eastern', name: 'Eastern' },
  { id: 'western', name: 'Western' },
  { id: 'southern', name: 'Southern' },
];

/** Special id: first screen option for distributors without a pre-seller */
export const DIRECT_ENTRY_OPTION_ID = '__distributor_direct__';

export const PRESELLERS: Preseller[] = [
  // Eastern
  { id: 'sonam-dorji', name: 'Sonam Dorji' },
  { id: 'sangay-tenzin', name: 'Sangay Tenzin' },
  { id: 'nirmala-chettri', name: 'Nirmala Chettri' },
  { id: 'pema-yangden', name: 'Pema Yangden' },
  { id: 'tshering-choden', name: 'Tshering Choden' },
];

export const DISTRIBUTORS: Distributor[] = [
  // —— Eastern ——
  {
    id: 'dangtshen-samdrupjongkhar',
    name: 'DANGTSHEN TSHONGKHANG',
    location: 'Samdrupjongkhar',
    zone: 'eastern',
    presellerId: null,
  },
  {
    id: 'ata-beverages-nganglam',
    name: 'M/S. ATA BEVERAGES',
    location: 'Nganglam',
    zone: 'eastern',
    presellerId: 'sonam-dorji',
  },
  {
    id: 'daejung-trashigang',
    name: 'DAEJUNG GENERAL SHOP',
    location: 'Trashigang',
    zone: 'eastern',
    presellerId: 'sangay-tenzin',
  },
  {
    id: 'kp-store-lhuntse',
    name: 'KP STORE',
    location: 'Lhuntse',
    zone: 'eastern',
    presellerId: null,
  },
  {
    id: 'rang-zhen-p-gytshel',
    name: 'RANG ZHEN DOEKI YONGDU TSHONGKHANG',
    location: 'P/Gytshel',
    zone: 'eastern',
    presellerId: 'nirmala-chettri',
  },
  {
    id: 'anita-trashigang-rangjung',
    name: 'MS. ANITA TSHONGKHANG',
    location: 'Trashigang Rangjung',
    zone: 'eastern',
    presellerId: 'sangay-tenzin',
  },
  {
    id: 'pema-lhamo-daifarm',
    name: 'PEMA LHAMO TSHONGKHANG',
    location: 'Daifarm',
    zone: 'eastern',
    presellerId: null,
  },
  {
    id: 'jimmy-tashi-yangtse',
    name: 'JIMMY COMMERCIAL',
    location: 'Tashi Yangtse',
    zone: 'eastern',
    presellerId: 'pema-yangden',
  },
  {
    id: 'phuntsho-rabgay-mongar',
    name: 'PHUNTSHO RABGAY TRADERS',
    location: 'Mongar',
    zone: 'eastern',
    presellerId: 'tshering-choden',
  },
  {
    id: 'rinchen-ghakil-lhuntse',
    name: 'RINCHEN GHAKIL TSHONGKHANG',
    location: 'Lhuntse',
    zone: 'eastern',
    presellerId: null,
  },
  {
    id: 'shingshap-samdrupjongkhar',
    name: 'SHINGSHAP TSHONGKHANG',
    location: 'Samdrupjongkhar',
    zone: 'eastern',
    presellerId: null,
  },
  {
    id: 'tashi-wangyal-mongar',
    name: 'TASHI WANGYAL TSHONGKHANG',
    location: 'Mongar',
    zone: 'eastern',
    presellerId: 'tshering-choden',
  },
  {
    id: 'yangchen-wamrong',
    name: 'YANGCHEN GENERAL STORE',
    location: 'Wamrong',
    zone: 'eastern',
    presellerId: 'sangay-tenzin',
  },
  {
    id: 'stobgay-gyalposhing',
    name: 'M/S S.TOBGAY GENERAL SHOP',
    location: 'Gyalposhing',
    zone: 'eastern',
    presellerId: 'tshering-choden',
  },
  {
    id: 'peldhen-lhamu-bhangtar',
    name: 'PELDHEN LHAMU GROCERY',
    location: 'Bhangtar',
    zone: 'eastern',
    presellerId: null,
  },

  // —— Western ——
  {
    id: 'jamyang-haa',
    name: 'JAMYANG',
    location: 'Haa',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'dargo-tsirang',
    name: 'DARGO',
    location: 'Tsirang',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'gurung-dagana',
    name: 'GURUNG',
    location: 'Dagana',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'karma-trongsa',
    name: 'KARMA',
    location: 'Trongsa',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'point-commercial-bajo',
    name: 'POINT COMMERCIAL',
    location: 'Bajo',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'mika-paro',
    name: 'MIKA',
    location: 'Paro',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'dnl-save-mart-bumthang',
    name: 'DNL SAVE MART',
    location: 'Bumthang',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'uden-tkhang-punakha',
    name: 'UDEN T/KHANG',
    location: 'Punakha',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'yeshey-liquor-paro',
    name: 'YESHEY LIQUOR',
    location: 'Paro',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'tshela-tkhang-trongsa',
    name: 'TSHELA T/KHANG',
    location: 'Trongsa',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'dawa-zangmo-bajo',
    name: 'DAWA ZANGMO',
    location: 'Bajo',
    zone: 'western',
    presellerId: null,
  },
  {
    id: 'namgay-stores-bumthang',
    name: 'NAMGAY STORES',
    location: 'Bumthang',
    zone: 'western',
    presellerId: null,
  },

  // —— Southern ——
  {
    id: 'sg-tkhang-tshimalakha',
    name: 'SG T/KHANG',
    location: 'Tshimalakha',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'chhetri-sipsu',
    name: 'CHHETRI',
    location: 'Sipsu',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'gelephu-grocery',
    name: 'GELEPHU GROCERY',
    location: 'Gelephu',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'kd-beer-zhemgang',
    name: 'KD BEER',
    location: 'Zhemgang',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'zeko-tala',
    name: 'ZEKO',
    location: 'Tala',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'pelzom-enterprise-samtse',
    name: 'PELZOM ENTERPRISE',
    location: 'Samtse',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'pema-general-gomtu',
    name: 'PEMA GENERAL',
    location: 'Gomtu',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'mukhia-general-kalikhola',
    name: 'MUKHIA GENERAL',
    location: 'Kalikhola',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'tshering-ent-samtse',
    name: 'TSHERING ENT.',
    location: 'Samtse',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'jai-prakash-samtse',
    name: 'JAI PRAKASH',
    location: 'Samtse',
    zone: 'southern',
    presellerId: null,
  },
  {
    id: 'dugar-gelephu',
    name: 'DUGAR',
    location: 'Gelephu',
    zone: 'southern',
    presellerId: null,
  },
];

export function getZoneName(zone: ZoneId): string {
  return ZONES.find((z) => z.id === zone)?.name ?? zone;
}

/** Only Eastern uses pre-seller selection. */
export function zoneHasPresellers(zone: ZoneId): boolean {
  return zone === 'eastern';
}

export function getPresellersInZone(zone: ZoneId): Preseller[] {
  const presellerIds = new Set(
    DISTRIBUTORS.filter((d) => d.zone === zone && d.presellerId).map((d) => d.presellerId as string)
  );
  return PRESELLERS.filter((p) => presellerIds.has(p.id));
}

export function getDistributorsForPreseller(presellerId: string, zone: ZoneId): Distributor[] {
  return DISTRIBUTORS.filter((d) => d.zone === zone && d.presellerId === presellerId);
}

export function getSelfServiceDistributors(zone: ZoneId): Distributor[] {
  return DISTRIBUTORS.filter((d) => d.zone === zone && d.presellerId === null);
}

export function countDistributorsInZone(zone: ZoneId): number {
  return DISTRIBUTORS.filter((d) => d.zone === zone).length;
}

export function getPresellerById(id: string): Preseller | undefined {
  return PRESELLERS.find((p) => p.id === id);
}

export function getDistributorById(id: string): Distributor | undefined {
  return DISTRIBUTORS.find((d) => d.id === id);
}

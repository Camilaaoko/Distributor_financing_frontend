/**
 * Kenya Geographic Registry & Spatial Data
 * 8 Administrative Regions & 47 Counties
 */

export interface CountyInfo {
  code: string; // e.g. "047"
  name: string; // e.g. "Nairobi"
  regionId: RegionId;
  regionName: string;
  capitalCity: string;
  majorHubs: string[];
}

export type RegionId =
  | 'nairobi'
  | 'central'
  | 'coast'
  | 'rift_valley'
  | 'western'
  | 'nyanza'
  | 'eastern'
  | 'north_eastern';

export interface RegionInfo {
  id: RegionId;
  name: string;
  shortCode: string;
  description: string;
  countyCount: number;
  centerCoordinates: { x: number; y: number }; // SVG map coordinates (viewBox 0 0 600 600)
  mapColor: string;
  counties: string[]; // County codes
}

export interface BankBranchRecord {
  id: string;
  bankCode: string;
  bankName: string;
  branchCode: string;
  branchName: string;
  location: string;
  city: string;
  countyCode: string;
  countyName: string;
  regionId: RegionId;
  status: 'ACTIVE' | 'PENDING' | 'MAINTENANCE';
  contactPhone?: string;
  contactEmail?: string;
}

export interface RegionBankCoverage {
  regionId: RegionId;
  regionName: string;
  countyCount: number;
  coveredCountyCount: number;
  totalBranches: number;
  bankCount: number;
  activeBanks: {
    bankCode: string;
    bankName: string;
    branchCount: number;
    status: 'ACTIVE' | 'PENDING';
  }[];
  densityLevel: 'HIGH' | 'MODERATE' | 'EMERGING';
  topBank: string;
  keyHubs: string[];
}

export interface CountyBankCoverage {
  countyCode: string;
  countyName: string;
  regionId: RegionId;
  regionName: string;
  capitalCity: string;
  totalBranches: number;
  bankCount: number;
  activeBanks: {
    bankCode: string;
    bankName: string;
    branchCount: number;
  }[];
  densityLevel: 'HIGH' | 'MODERATE' | 'GROWING';
  status: 'ACTIVE' | 'GROWING' | 'PENDING';
  branches: BankBranchRecord[];
}

export interface GeoSummaryMetrics {
  totalBanks: number;
  totalBranches: number;
  totalRegions: number;
  activeRegions: number;
  totalCounties: number;
  activeCounties: number;
  topDensityRegion: string;
  leadingBankName: string;
  leadingBankBranches: number;
}

export const KENYA_REGIONS: Record<RegionId, RegionInfo> = {
  nairobi: {
    id: 'nairobi',
    name: 'Nairobi Region',
    shortCode: 'NRB',
    description: 'National Financial Capital & Commercial Headquarters Hub',
    countyCount: 1,
    centerCoordinates: { x: 260, y: 405 },
    mapColor: '#1F4DA8',
    counties: ['047'],
  },
  central: {
    id: 'central',
    name: 'Central Region',
    shortCode: 'CEN',
    description: 'Mount Kenya Agricultural, Manufacturing & Agribusiness Corridor',
    countyCount: 5,
    centerCoordinates: { x: 275, y: 350 },
    mapColor: '#2563EB',
    counties: ['018', '019', '020', '021', '022'],
  },
  coast: {
    id: 'coast',
    name: 'Coast Region',
    shortCode: 'CST',
    description: 'Maritime Port Trade, Tourism & Indian Ocean Blue Economy Hub',
    countyCount: 6,
    centerCoordinates: { x: 440, y: 425 },
    mapColor: '#0EA5E9',
    counties: ['001', '002', '003', '004', '005', '006'],
  },
  rift_valley: {
    id: 'rift_valley',
    name: 'Rift Valley Region',
    shortCode: 'RV',
    description: 'Breadbasket Agricultural, Geothermal & Western Gateway Hub',
    countyCount: 14,
    centerCoordinates: { x: 215, y: 220 },
    mapColor: '#3B82F6',
    counties: ['023', '024', '025', '026', '027', '028', '029', '030', '031', '032', '033', '034', '035', '036'],
  },
  nyanza: {
    id: 'nyanza',
    name: 'Nyanza Region',
    shortCode: 'NYZ',
    description: 'Lake Victoria Basin, Cross-Border Trade & Fish Value Chains',
    countyCount: 6,
    centerCoordinates: { x: 145, y: 395 },
    mapColor: '#6366F1',
    counties: ['041', '042', '043', '044', '045', '046'],
  },
  western: {
    id: 'western',
    name: 'Western Region',
    shortCode: 'WST',
    description: 'Sugarcane Agro-Processing & Great Lakes Cross-Border Transit',
    countyCount: 4,
    centerCoordinates: { x: 145, y: 310 },
    mapColor: '#8B5CF6',
    counties: ['037', '038', '039', '040'],
  },
  eastern: {
    id: 'eastern',
    name: 'Eastern Region',
    shortCode: 'EST',
    description: 'Livestock, Horticulture, Trade Corridors & Mining Hub',
    countyCount: 8,
    centerCoordinates: { x: 355, y: 220 },
    mapColor: '#10B981',
    counties: ['010', '011', '012', '013', '014', '015', '016', '017'],
  },
  north_eastern: {
    id: 'north_eastern',
    name: 'North Eastern Region',
    shortCode: 'NE',
    description: 'Horn of Africa Livestock Corridors & Cross-Border Logistics',
    countyCount: 3,
    centerCoordinates: { x: 485, y: 195 },
    mapColor: '#F59E0B',
    counties: ['007', '008', '009'],
  },
};

export const KENYA_COUNTIES: CountyInfo[] = [
  // Coast
  { code: '001', name: 'Mombasa', regionId: 'coast', regionName: 'Coast Region', capitalCity: 'Mombasa', majorHubs: ['Mombasa CBD', 'Nyali', 'Changamwe', 'Likoni', 'Mvita'] },
  { code: '002', name: 'Kwale', regionId: 'coast', regionName: 'Coast Region', capitalCity: 'Kwale', majorHubs: ['Diani', 'Ukunda', 'Kwale Town', 'Msambweni'] },
  { code: '003', name: 'Kilifi', regionId: 'coast', regionName: 'Coast Region', capitalCity: 'Kilifi', majorHubs: ['Kilifi Town', 'Malindi', 'Mtwapa', 'Mariakani'] },
  { code: '004', name: 'Tana River', regionId: 'coast', regionName: 'Coast Region', capitalCity: 'Hola', majorHubs: ['Hola', 'Madogo', 'Bura'] },
  { code: '005', name: 'Lamu', regionId: 'coast', regionName: 'Coast Region', capitalCity: 'Lamu', majorHubs: ['Lamu Island', 'Mpeketoni', 'LAPSSET Port Area'] },
  { code: '006', name: 'Taita-Taveta', regionId: 'coast', regionName: 'Coast Region', capitalCity: 'Mwatate', majorHubs: ['Voi', 'Taveta', 'Wundanyi', 'Mwatate'] },

  // North Eastern
  { code: '007', name: 'Garissa', regionId: 'north_eastern', regionName: 'North Eastern Region', capitalCity: 'Garissa', majorHubs: ['Garissa Town', 'Dadaab', 'Masalani'] },
  { code: '008', name: 'Wajir', regionId: 'north_eastern', regionName: 'North Eastern Region', capitalCity: 'Wajir', majorHubs: ['Wajir Town', 'Habaswein', 'Bute'] },
  { code: '009', name: 'Mandera', regionId: 'north_eastern', regionName: 'North Eastern Region', capitalCity: 'Mandera', majorHubs: ['Mandera Town', 'Elwak', 'Rhamu'] },

  // Eastern
  { code: '010', name: 'Marsabit', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Marsabit', majorHubs: ['Marsabit Town', 'Moyale', 'Laisamis'] },
  { code: '011', name: 'Isiolo', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Isiolo', majorHubs: ['Isiolo Town', 'Garbatulla', 'Merti'] },
  { code: '012', name: 'Meru', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Meru', majorHubs: ['Meru Town', 'Nkubu', 'Maua', 'Timau'] },
  { code: '013', name: 'Tharaka-Nithi', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Kathwana', majorHubs: ['Chuka', 'Kathwana', 'Marimanti'] },
  { code: '014', name: 'Embu', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Embu', majorHubs: ['Embu Town', 'Runyenjes', 'Siakago'] },
  { code: '015', name: 'Kitui', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Kitui', majorHubs: ['Kitui Town', 'Mwingi', 'Mutomo'] },
  { code: '016', name: 'Machakos', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Machakos', majorHubs: ['Machakos Town', 'Athi River', 'Mlolongo', 'Tala', 'Kangundo'] },
  { code: '017', name: 'Makueni', regionId: 'eastern', regionName: 'Eastern Region', capitalCity: 'Wote', majorHubs: ['Wote', 'Emali', 'Makindu', 'Mtito Andei'] },

  // Central
  { code: '018', name: 'Nyandarua', regionId: 'central', regionName: 'Central Region', capitalCity: 'Ol Kalou', majorHubs: ['Ol Kalou', 'Engineer', 'Nyahururu'] },
  { code: '019', name: 'Nyeri', regionId: 'central', regionName: 'Central Region', capitalCity: 'Nyeri', majorHubs: ['Nyeri Town', 'Karatina', 'Othaya', 'Mukurwe-ini'] },
  { code: '020', name: 'Kirinyaga', regionId: 'central', regionName: 'Central Region', capitalCity: 'Kerugoya', majorHubs: ['Kerugoya', 'Kutus', 'Sagana', 'Wanguru'] },
  { code: '021', name: "Murang'a", regionId: 'central', regionName: 'Central Region', capitalCity: "Murang'a", majorHubs: ["Murang'a Town", 'Kenol', 'Thika North', 'Kangema'] },
  { code: '022', name: 'Kiambu', regionId: 'central', regionName: 'Central Region', capitalCity: 'Kiambu', majorHubs: ['Thika', 'Ruiru', 'Kikuyu', 'Kiambu Town', 'Limuru', 'Karuri'] },

  // Rift Valley
  { code: '023', name: 'Turkana', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Lodwar', majorHubs: ['Lodwar', 'Kakuma', 'Lokichogio'] },
  { code: '024', name: 'West Pokot', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Kapenguria', majorHubs: ['Kapenguria', 'Makutano', 'Chepareria'] },
  { code: '025', name: 'Samburu', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Maralal', majorHubs: ['Maralal', 'Baragoi', 'Wamba'] },
  { code: '026', name: 'Trans Nzoia', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Kitale', majorHubs: ['Kitale', 'Kiminini', 'Endebess'] },
  { code: '027', name: 'Uasin Gishu', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Eldoret', majorHubs: ['Eldoret CBD', 'Turbo', 'Burnt Forest', 'Moiben'] },
  { code: '028', name: 'Elgeyo-Marakwet', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Iten', majorHubs: ['Iten', 'Kapsowar', 'Tambach'] },
  { code: '029', name: 'Nandi', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Kapsabet', majorHubs: ['Kapsabet', 'Nandi Hills', 'Mosoriot'] },
  { code: '030', name: 'Baringo', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Kabarnet', majorHubs: ['Kabarnet', 'Eldama Ravine', 'Marigat'] },
  { code: '031', name: 'Laikipia', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Rumuruti', majorHubs: ['Nanyuki', 'Nyahururu', 'Rumuruti'] },
  { code: '032', name: 'Nakuru', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Nakuru', majorHubs: ['Nakuru City CBD', 'Naivasha', 'Molo', 'Gilgil', 'Njoro'] },
  { code: '033', name: 'Narok', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Narok', majorHubs: ['Narok Town', 'Kilgoris', 'Ololulunga'] },
  { code: '034', name: 'Kajiado', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Kajiado', majorHubs: ['Kitengela', 'Ngong', 'Ongata Rongai', 'Kajiado Town', 'Loitokitok'] },
  { code: '035', name: 'Kericho', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Kericho', majorHubs: ['Kericho Town', 'Litein', 'Kipkelion'] },
  { code: '036', name: 'Bomet', regionId: 'rift_valley', regionName: 'Rift Valley Region', capitalCity: 'Bomet', majorHubs: ['Bomet Town', 'Sotik', 'Silibwet'] },

  // Western
  { code: '037', name: 'Kakamega', regionId: 'western', regionName: 'Western Region', capitalCity: 'Kakamega', majorHubs: ['Kakamega Town', 'Mumias', 'Malava', 'Lugari'] },
  { code: '038', name: 'Vihiga', regionId: 'western', regionName: 'Western Region', capitalCity: 'Mbale', majorHubs: ['Mbale', 'Chavakali', 'Luanda'] },
  { code: '039', name: 'Bungoma', regionId: 'western', regionName: 'Western Region', capitalCity: 'Bungoma', majorHubs: ['Bungoma Town', 'Webuye', 'Kimilili', 'Sirisia'] },
  { code: '040', name: 'Busia', regionId: 'western', regionName: 'Western Region', capitalCity: 'Busia', majorHubs: ['Busia One-Stop Border', 'Malaba', 'Nambale', 'Port Victoria'] },

  // Nyanza
  { code: '041', name: 'Siaya', regionId: 'nyanza', regionName: 'Nyanza Region', capitalCity: 'Siaya', majorHubs: ['Siaya Town', 'Bondo', 'Ugunja', 'Yala'] },
  { code: '042', name: 'Kisumu', regionId: 'nyanza', regionName: 'Nyanza Region', capitalCity: 'Kisumu', majorHubs: ['Kisumu City CBD', 'Mega Plaza', 'Kondele', 'Ahero', 'Maseno'] },
  { code: '043', name: 'Homa Bay', regionId: 'nyanza', regionName: 'Nyanza Region', capitalCity: 'Homa Bay', majorHubs: ['Homa Bay Town', 'Mbita', 'Oyugis', 'Ndhiwa'] },
  { code: '044', name: 'Migori', regionId: 'nyanza', regionName: 'Nyanza Region', capitalCity: 'Migori', majorHubs: ['Migori Town', 'Isebania Border', 'Rongo', 'Kehancha'] },
  { code: '045', name: 'Kisii', regionId: 'nyanza', regionName: 'Nyanza Region', capitalCity: 'Kisii', majorHubs: ['Kisii Town', 'Ogembo', 'Suneka', 'Keroka'] },
  { code: '046', name: 'Nyamira', regionId: 'nyanza', regionName: 'Nyanza Region', capitalCity: 'Nyamira', majorHubs: ['Nyamira Town', 'Nyansiongo', 'Keroka North'] },

  // Nairobi
  { code: '047', name: 'Nairobi', regionId: 'nairobi', regionName: 'Nairobi Region', capitalCity: 'Nairobi', majorHubs: ['Nairobi CBD', 'Westlands', 'Upper Hill', 'Industrial Area', 'Eastleigh', 'Karen', 'Kilimani', 'Gigiri'] },
];

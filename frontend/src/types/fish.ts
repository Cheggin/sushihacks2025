export interface FishOccurrence {
  id: string;
  catalogNumber: string;
  scientificName: string;
  vernacularName?: string;
  decimalLatitude: number;
  decimalLongitude: number;
  country?: string;
  waterBody?: string;
  locality?: string;
  year?: number;
  month?: number;
  individualCount?: number;
  genus?: string;
  family?: string;
}

export interface PlaceLocation {
    lat: number;
    lng: number;
    address: string | null; // Handle address being null
    staticMapImageUrl: string | null;
  }
  
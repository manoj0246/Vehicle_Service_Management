export interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: number;
  durationMinutes: number;
  centerId: number;
  centerName?: string;
}

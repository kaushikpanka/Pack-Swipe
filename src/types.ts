export type TripTemplateId = 'beach' | 'business' | 'weekend';

export type DecisionStatus = 'unreviewed' | 'pack' | 'later' | 'skip';

export interface PackingItem {
  id: string;
  name: string;
  category: string;
  note: string;
  status: DecisionStatus;
  isPackedInLuggage?: boolean; // Checkbox state in final list (packed into suitcase)
  quantity?: number;
  weightHint?: string;
  isCustom?: boolean;
  image?: string;
  tip?: string;
}

export interface TripTemplate {
  id: TripTemplateId;
  title: string;
  tagline: string;
  icon: string;
  description: string;
  itemCount: number;
  defaultTripName: string;
  duration: string;
  destinationPreview: {
    location: string;
    weather: string;
    bgImage: string;
  };
  sampleImages: string[];
  items: Omit<PackingItem, 'status' | 'isPackedInLuggage'>[];
}

export type LuggageTier = 'personal' | 'carryon' | 'checked';

export interface Trip {
  id: string;
  name: string;
  templateId: TripTemplateId;
  items: PackingItem[];
  createdAt: string;
  isCompleted?: boolean;
  duration?: string;
  decisionTimeSeconds?: number;
  luggageTier?: LuggageTier;
  isReturnRepackMode?: boolean;
}

export type AppScreen =
  | 'welcome'
  | 'trip-setup'
  | 'list-preview'
  | 'swipe'
  | 'decision-complete'
  | 'review'
  | 'trip-complete';

export type NavTab = 'planner' | 'swipe' | 'review' | 'summary';

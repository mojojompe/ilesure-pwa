export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
}

export interface InputProps {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  error?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  multiline?: boolean;
  numberOfLines?: number;
  disabled?: boolean;
  rightIcon?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export interface CardProps {
  children: React.ReactNode;
  style?: object;
  onPress?: () => void;
  variant?: 'default' | 'elevated';
}

export interface ListingCardProps {
  id: string;
  title: string;
  price: string;
  distance: string;
  image: string;
  furnishing: string;
  power: string;
  water: string;
  onPress?: () => void;
  onInterest?: () => void;
}

export interface MatchCardProps {
  id: string;
  name: string;
  score: number;
  topMatches: string[];
  conflicts?: string[];
  onPress?: () => void;
  onInterest?: () => void;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'student' | 'landlord' | 'admin';
  gender?: 'male' | 'female';
  createdAt: string;
}

export interface Listing {
  _id: string;
  id: string;
  landlordId: string;
  title: string;
  description: string;
  rentAnnual: number;
  areaCluster: string;
  distanceBucket: string;
  furnishing: 'fully_furnished' | 'semi-furnished' | 'unfurnished' | 'furnished' | 'semifurnished';
  power: 'constant' | 'gen-dependent' | 'solar-backed' | 'phcn' | 'generator' | 'solar' | 'hybrid';
  water: 'borehole' | 'public' | 'tank';
  maxOccupants: number;
  genderRestriction: 'any' | 'male_only' | 'female_only' | 'mixed' | 'male' | 'female';
  status: 'pending_approval' | 'active' | 'needs_roommate' | 'fully_booked' | 'archived' | 'rejected';
  images: string[];
  createdAt: string;
  // Extended optional fields
  propertyType?: string;
  needsRoommate?: boolean;
  shareable?: boolean;
  agentId?: string | { _id: string; fullName: string };
  companyId?: string | { _id: string; name: string };
  agentName?: string;
  agentRating?: number;
  companyName?: string;
  wifi?: boolean;
  cautionFee?: number;
  agencyFee?: number;
  leaseDuration?: string;
  paymentFrequency?: 'annually' | 'bi-annually' | 'quarterly' | 'monthly' | 'custom';
  customPaymentPlan?: {
    installments: number;
    interval: 'monthly' | 'bi-monthly';
    amountPerInstallment: number;
  };
  shortletPricing?: {
    hourly?: number;
    daily?: number;
    weekly?: number;
    monthly?: number;
  };
  rules?: string[];
  additionalNotes?: string;
  inspectionAvailability?: {
    availableDays?: string[];
    timeSlots?: string[];
    notes?: string;
  };
  petsAllowed?: boolean;
  smokingAllowed?: boolean;
  studentsOnly?: boolean;
}

export interface RoommateProfile {
  _id: string;
  userId: string;
  listingId?: string;
  gender?: 'male' | 'female';
  lookingFor: 'room' | 'apartment' | 'house' | 'any';
  preferredAreaClusters: string[];
  budgetMin: number;
  budgetMax: number;
  preferredGender: 'any' | 'male' | 'female';
  maxOccupants: number;
  age?: number;
  noiseTolerance: 'quiet' | 'moderate' | 'loud';
  cleanliness: 'relaxed' | 'moderate' | 'strict';
  sleepSchedule: 'early' | 'moderate' | 'night-owl';
  studySchedule: 'home' | 'mixed' | 'library';
  socialActivity: 'introvert' | 'balanced' | 'extrovert';
  guestComfort: 'no-guests' | 'occasional' | 'frequent';
  cookingFrequency: 'never' | 'weekly' | 'daily';
  smokingAlcohol: 'not-ok' | 'neutral' | 'ok';
  powerUsage: 'minimal' | 'moderate' | 'heavy';
  openness: number;
  religionImportance: number;
  preferredCleanliness?: 'relaxed' | 'moderate' | 'strict' | 'any';
  preferredNoiseTolerance?: 'quiet' | 'moderate' | 'loud' | 'any';
  preferredSleepSchedule?: 'early' | 'moderate' | 'night-owl' | 'any';
  preferredSmokingAlcohol?: 'not-ok' | 'neutral' | 'ok' | 'any';
  preferredGuestComfort?: 'no-guests' | 'occasional' | 'frequent' | 'any';
  preferredSocialActivity?: 'introvert' | 'balanced' | 'extrovert' | 'any';
  bio?: string;
  courseOfStudy?: string;
  institution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoommateMatch {
  id: string;
  userAId: string;
  userBId: string;
  score: number;
  topMatches: string[];
  conflicts: string[];
  suggestedZones: string[];
  aInterested: boolean;
  bInterested: boolean;
  contactReleasedAt?: string;
  createdAt: string;
}

export interface WaitlistEntry {
  id: string;
  userId: string;
  budgetMin: number;
  budgetMax: number;
  preferredCorridor: string;
  moveInDate: string;
  roommateNeeded: boolean;
  distancePreference: string;
  contactPreference: 'call' | 'whatsapp' | 'email';
  createdAt: string;
}

export interface Notification {
  _id: string;
  userId: string;
  type: 'match' | 'listing' | 'waitlist' | 'interest' | 'booking' | 'verification' | 'message' | 'system';
  title: string;
  body: string;
  read: boolean;
  readAt?: string;
  data?: Record<string, any>;
  createdAt: string;
}

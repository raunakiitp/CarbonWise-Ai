/**
 * @fileoverview TypeScript type definitions for CarbonWise AI
 * All interfaces are strictly typed for enterprise-grade reliability
 */

// ============================================================
// USER & AUTH
// ============================================================

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
  settings: UserSettings;
  sustainabilityScore: number;
  totalCarbonSaved: number;
  level: UserLevel;
  badges: string[];
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  notifications: boolean;
  units: "metric" | "imperial";
  country: string;
  language: string;
}

export type UserLevel = "Beginner" | "Explorer" | "Advocate" | "Champion" | "Legend";

// ============================================================
// CARBON DATA
// ============================================================

export interface CarbonInput {
  // Transportation (kg CO₂e/month)
  transportation: TransportationInput;
  // Home energy
  energy: EnergyInput;
  // Food & diet
  food: FoodInput;
  // Shopping
  shopping: ShoppingInput;
  // Water usage
  water: WaterInput;
  // Waste
  waste: WasteInput;
}

export interface TransportationInput {
  carKmPerWeek: number;
  carType: "electric" | "hybrid" | "petrol" | "diesel" | "none";
  flightsPerYear: number;
  publicTransportKmPerWeek: number;
  cyclingKmPerWeek: number;
  walkingKmPerWeek: number;
}

export interface EnergyInput {
  electricityKwhPerMonth: number;
  heatingType: "gas" | "electric" | "oil" | "heat-pump" | "solar" | "none";
  renewablePercentage: number;
  householdSize: number;
}

export interface FoodInput {
  dietType: "vegan" | "vegetarian" | "pescatarian" | "flexitarian" | "omnivore" | "heavy-meat";
  mealFrequency: number; // meals per day
  foodWastePercentage: number;
  localFoodPercentage: number;
}

export interface ShoppingInput {
  clothingItemsPerMonth: number;
  electronicsPerYear: number;
  onlineOrdersPerWeek: number;
  secondHandPercentage: number;
}

export interface WaterInput {
  showersPerWeek: number;
  showerDurationMinutes: number;
  bathsPerWeek: number;
  dishwasherUsesPerWeek: number;
  laundryLoadsPerWeek: number;
}

export interface WasteInput {
  recyclingRate: number; // 0-100%
  compostingEnabled: boolean;
  wasteKgPerWeek: number;
}

// ============================================================
// CARBON RESULTS
// ============================================================

export interface CarbonResult {
  id?: string;
  userId: string;
  timestamp: Date;
  input: CarbonInput;
  monthly: CategoryEmissions;
  annual: CategoryEmissions;
  totalMonthlyCo2: number;
  totalAnnualCo2: number;
  hotspots: EmissionHotspot[];
  sustainabilityScore: number; // 0-100
  comparisonToAverage: number; // % vs global average
}

export interface CategoryEmissions {
  transportation: number;
  energy: number;
  food: number;
  shopping: number;
  water: number;
  waste: number;
}

export interface EmissionHotspot {
  category: keyof CategoryEmissions;
  value: number;
  percentage: number;
  severity: "critical" | "high" | "medium" | "low";
  recommendation: string;
}

// ============================================================
// PREDICTIONS
// ============================================================

export interface CarbonPrediction {
  userId: string;
  generatedAt: Date;
  currentMonthly: number;
  predictions: MonthlyPrediction[];
  scenarioBau: MonthlyPrediction[]; // business as usual
  scenarioOptimistic: MonthlyPrediction[]; // with recommended actions
  yearlyReductionPotential: number;
  confidenceScore: number;
}

export interface MonthlyPrediction {
  month: string; // "2025-01"
  predicted: number;
  lower: number; // confidence interval
  upper: number;
}

// ============================================================
// GOALS
// ============================================================

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: keyof CategoryEmissions | "overall";
  targetReduction: number; // kg CO₂e
  targetDate: Date;
  startDate: Date;
  currentProgress: number;
  status: "active" | "completed" | "failed" | "paused";
  milestones: GoalMilestone[];
  carbonSaved: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GoalMilestone {
  id: string;
  title: string;
  targetValue: number;
  completedAt?: Date;
  isCompleted: boolean;
}

// ============================================================
// GREEN ACTIONS
// ============================================================

export interface GreenAction {
  id: string;
  userId: string;
  actionType: ActionType;
  date: Date;
  value?: number; // km walked, trees planted, etc.
  carbonSaved: number; // kg CO₂e
  notes?: string;
  streakDay?: number;
}

export type ActionType =
  | "walking"
  | "cycling"
  | "tree-planting"
  | "recycling"
  | "public-transport"
  | "energy-saving"
  | "meatless-meal"
  | "reusable-bag"
  | "cold-wash"
  | "local-food";

export interface ActionStreak {
  actionType: ActionType;
  currentStreak: number;
  longestStreak: number;
  lastActionDate: Date;
  totalActions: number;
  totalCarbonSaved: number;
}

// ============================================================
// COMMUNITY CHALLENGES
// ============================================================

export interface CommunityChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  startDate: Date;
  endDate: Date;
  targetReduction: number;
  participantsCount: number;
  badge: string;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
}

export interface ChallengeParticipation {
  id: string;
  userId: string;
  challengeId: string;
  joinedAt: Date;
  progress: number; // 0-100%
  carbonSaved: number;
  rank?: number;
}

// ============================================================
// EDUCATION
// ============================================================

export interface EducationModule {
  id: string;
  title: string;
  description: string;
  category: EducationCategory;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  topics: EducationTopic[];
  quizQuestions: QuizQuestion[];
  completedByUserId?: string[];
}

export type EducationCategory =
  | "climate-basics"
  | "transportation"
  | "energy"
  | "food"
  | "consumption"
  | "biodiversity"
  | "solutions";

export interface EducationTopic {
  id: string;
  title: string;
  content: string;
  iconEmoji: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface UserProgress {
  userId: string;
  completedModules: string[];
  quizScores: Record<string, number>;
  totalPoints: number;
}

// ============================================================
// REPORTS
// ============================================================

export interface MonthlyReport {
  id: string;
  userId: string;
  month: string; // "2025-01"
  generatedAt: Date;
  totalEmissions: number;
  categoryBreakdown: CategoryEmissions;
  changeFromLastMonth: number; // percentage
  goalsCompleted: number;
  actionsLogged: number;
  carbonSaved: number;
  sustainabilityScore: number;
  aiNarrative: string;
  recommendations: string[];
}

// ============================================================
// AI / GEMINI
// ============================================================

export interface GeminiMessage {
  role: "user" | "model";
  content: string;
  timestamp: Date;
}

export interface GeminiCoachSession {
  id: string;
  userId: string;
  messages: GeminiMessage[];
  startedAt: Date;
  context?: CarbonResult;
}

export interface ReceiptScanResult {
  items: ScannedItem[];
  totalCarbonImpact: number;
  alternatives: GreenAlternative[];
  scanConfidence: number;
}

export interface ScannedItem {
  name: string;
  category: string;
  quantity?: number;
  estimatedCo2: number;
  impactLevel: "low" | "medium" | "high";
}

export interface GreenAlternative {
  originalItem: string;
  alternative: string;
  co2Saved: number;
  description: string;
}

// ============================================================
// MAPS
// ============================================================

export type MapPlaceType =
  | "recycling_center"
  | "ev_charging"
  | "public_transport"
  | "sustainable_store"
  | "community_event";

export interface GreenPlace {
  id: string;
  name: string;
  type: MapPlaceType;
  address: string;
  lat: number;
  lng: number;
  rating?: number;
  isOpen?: boolean;
  distance?: number; // km
}

// ============================================================
// CHARTS
// ============================================================

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface TimeSeriesPoint {
  date: string;
  value: number;
  predicted?: boolean;
}

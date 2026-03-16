export const PROPERTY_STATUS = [
  "analyzing",
  "approved",
  "rejected",
  "ready_for_bid",
  "bid_submitted",
  "won",
] as const;

export const AUCTION_TYPE = ["judicial", "extrajudicial", "bank"] as const;

export const BID_STATUS = ["planned", "submitted", "lost", "won"] as const;

export const TASK_PRIORITY = ["low", "medium", "high"] as const;

export const DOCUMENT_TYPE = ["edital", "matricula", "processo", "fotos", "relatorio"] as const;

export const TASK_STATUS = ["pending", "in_progress", "done", "late"] as const;

export const POST_AUCTION_STATUS = [
  "pagamento_pendente",
  "pagamento_realizado",
  "regularizacao",
  "reforma",
  "pronto_para_venda",
  "vendido",
] as const;

export const CONTACT_TYPE = [
  "advogado",
  "corretor",
  "engenheiro",
  "despachante",
  "cartorio",
  "outros",
] as const;

export const APP_ROLE = ["user", "admin"] as const;

export type PropertyStatus = (typeof PROPERTY_STATUS)[number];
export type AuctionType = (typeof AUCTION_TYPE)[number];
export type BidStatus = (typeof BID_STATUS)[number];
export type TaskPriority = (typeof TASK_PRIORITY)[number];
export type TaskStatus = (typeof TASK_STATUS)[number];
export type DocumentType = (typeof DOCUMENT_TYPE)[number];
export type PostAuctionStatus = (typeof POST_AUCTION_STATUS)[number];
export type ContactType = (typeof CONTACT_TYPE)[number];
export type AppRole = (typeof APP_ROLE)[number];

export type UUID = string;
export type ISODateString = string;

export interface Property {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  auction_id: UUID | null;
  address: string;
  city: string;
  state: string;
  property_type: string;
  source_url: string | null;
  size_sqm: number | null;
  occupied: boolean;
  market_value: number | null;
  min_bid: number | null;
  renovation_cost: number | null;
  status: PropertyStatus;
  watchlist: boolean;
}

export interface Auction {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  auctioneer: string;
  platform: string | null;
  auction_type: AuctionType;
  first_auction_at: ISODateString;
  second_auction_at: ISODateString | null;
  commission_percent: number;
  payment_terms: string | null;
  notice_url: string | null;
}

export interface PropertyAnalysis {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  property_id: UUID;
  market_value: number;
  max_bid: number;
  estimated_sale_value: number;
  renovation_cost: number;
  legal_cost: number;
  itbi_cost: number;
  registration_cost: number;
  eviction_cost: number;
  estimated_profit: number;
  roi_percent: number;
  safety_margin: number;
  break_even_value: number;
}

export interface Bid {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  property_id: UUID;
  auction_id: UUID;
  max_bid: number;
  placed_bid: number | null;
  status: BidStatus;
}

export interface Document {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  property_id: UUID;
  type: DocumentType;
  file_name: string;
  storage_path: string;
  file_url: string | null;
}

export interface Task {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  property_id: UUID | null;
  name: string;
  due_date: ISODateString;
  priority: TaskPriority;
  status: TaskStatus;
}

export interface Contact {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  type: ContactType;
  name: string;
  role: string | null;
  company: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
}

export interface Report {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  name: string;
  period_start: ISODateString | null;
  period_end: ISODateString | null;
  avg_roi: number | null;
  success_rate: number | null;
  invested_capital: number | null;
  discarded_properties: number | null;
}

export interface PostAuction {
  id: UUID;
  user_id: UUID;
  created_at: ISODateString;
  updated_at: ISODateString;
  property_id: UUID;
  bid_id: UUID | null;
  status: PostAuctionStatus;
  payment_amount: number | null;
  auctioneer_commission: number | null;
  registry_status: string | null;
  eviction_status: string | null;
  renovation_notes: string | null;
  resale_value: number | null;
}

export interface UserProfile {
  user_id: UUID;
  role: AppRole;
  created_at: ISODateString;
  updated_at: ISODateString;
}

export type NewProperty = Omit<Property, "id" | "created_at" | "updated_at" | "user_id">;
export type NewAuction = Omit<Auction, "id" | "created_at" | "updated_at" | "user_id">;
export type NewPropertyAnalysis = Omit<PropertyAnalysis, "id" | "created_at" | "updated_at" | "user_id">;
export type NewBid = Omit<Bid, "id" | "created_at" | "updated_at" | "user_id">;
export type NewDocument = Omit<Document, "id" | "created_at" | "updated_at" | "user_id">;
export type NewTask = Omit<Task, "id" | "created_at" | "updated_at" | "user_id">;
export type NewContact = Omit<Contact, "id" | "created_at" | "updated_at" | "user_id">;
export type NewReport = Omit<Report, "id" | "created_at" | "updated_at" | "user_id">;
export type NewPostAuction = Omit<PostAuction, "id" | "created_at" | "updated_at" | "user_id">;
export type NewUserProfile = Omit<UserProfile, "created_at" | "updated_at">;

export type UpdateProperty = Partial<NewProperty>;
export type UpdateAuction = Partial<NewAuction>;
export type UpdatePropertyAnalysis = Partial<NewPropertyAnalysis>;
export type UpdateBid = Partial<NewBid>;
export type UpdateDocument = Partial<NewDocument>;
export type UpdateTask = Partial<NewTask>;
export type UpdateContact = Partial<NewContact>;
export type UpdateReport = Partial<NewReport>;
export type UpdatePostAuction = Partial<NewPostAuction>;
export type UpdateUserProfile = Partial<Omit<UserProfile, "user_id" | "created_at" | "updated_at">>;

export interface DashboardMetrics {
  total_properties: number;
  ready_for_bid: number;
  weekly_auctions: number;
  bids_submitted: number;
  won_properties: number;
  invested_capital: number;
}

export interface DashboardPoint {
  label: string;
  value: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  auctions_by_month: DashboardPoint[];
  success_rate: DashboardPoint[];
  average_roi: DashboardPoint[];
  watchlist: Property[];
  upcoming_auctions: Auction[];
  risk_alerts: Task[];
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface ApiSuccess<T> {
  data: T;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface Database {
  public: {
    Tables: {
      properties: {
        Row: Property;
        Insert: Partial<NewProperty>;
        Update: UpdateProperty;
      };
      auctions: {
        Row: Auction;
        Insert: Partial<NewAuction>;
        Update: UpdateAuction;
      };
      analysis: {
        Row: PropertyAnalysis;
        Insert: Partial<NewPropertyAnalysis>;
        Update: UpdatePropertyAnalysis;
      };
      bids: {
        Row: Bid;
        Insert: Partial<NewBid>;
        Update: UpdateBid;
      };
      documents: {
        Row: Document;
        Insert: Partial<NewDocument>;
        Update: UpdateDocument;
      };
      tasks: {
        Row: Task;
        Insert: Partial<NewTask>;
        Update: UpdateTask;
      };
      contacts: {
        Row: Contact;
        Insert: Partial<NewContact>;
        Update: UpdateContact;
      };
      reports: {
        Row: Report;
        Insert: Partial<NewReport>;
        Update: UpdateReport;
      };
      post_auction: {
        Row: PostAuction;
        Insert: Partial<NewPostAuction>;
        Update: UpdatePostAuction;
      };
      user_profiles: {
        Row: UserProfile;
        Insert: Partial<NewUserProfile>;
        Update: UpdateUserProfile;
      };
    };
    Enums: {
      property_status: PropertyStatus;
      auction_type: AuctionType;
      bid_status: BidStatus;
      task_priority: TaskPriority;
      document_type: DocumentType;
      app_role: AppRole;
    };
  };
}

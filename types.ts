import { z } from 'zod';
import {
  BusinessSchema,
  ServiceSchema,
  AppointmentSchema,
  CustomerSchema,
  NotificationSchema,
  FiltersSchema,
  ZypprResponseSchema,
  UserSchema,
  StudioPictureSchema,
  AnnouncementSchema,
  CustomerProfileSchema,
  ScheduleEntrySchema
} from './lib/schemas';


// --- Inferred types from Zod Schemas ---
// This ensures our runtime validation and static types are always in sync.

export type Business = z.infer<typeof BusinessSchema>;
export type ScheduleEntry = z.infer<typeof ScheduleEntrySchema>;
export type Service = z.infer<typeof ServiceSchema>;
export type Appointment = z.infer<typeof AppointmentSchema>;
export type Customer = z.infer<typeof CustomerSchema>;
export type Notification = z.infer<typeof NotificationSchema>;
export type Filters = z.infer<typeof FiltersSchema>;
export type ZypprResponse = z.infer<typeof ZypprResponseSchema>;
export type User = z.infer<typeof UserSchema>;
export type StudioPicture = z.infer<typeof StudioPictureSchema>;
export type Announcement = z.infer<typeof AnnouncementSchema>;


// --- Non-AI Contract Types ---

export type Role = 'user' | 'business_owner';

// For UI state, not part of the AI contract directly
export type CustomerProfile = z.infer<typeof CustomerProfileSchema>;

export interface BusinessProfile {
  business_name: string;
  address: string;
  zipcode: string;
  category: 'Yoga' | 'Fitness' | 'Yoga & Fitness Center';
  pictures: StudioPicture[];
  announcements: Announcement[];
}


export interface AuthContextType {
  user: User | null;
  businesses: Business[];
  login: (email: string, password: string, role: Role) => Promise<void>;
  signup: (role: Role, data: Record<string, string>) => Promise<void>;
  logout: () => void;
  getBusinessById: (id: string) => Business | undefined;
  addPicture: (businessId: string, picture: Omit<StudioPicture, 'id'>) => void;
  addAnnouncement: (businessId: string, message: string) => void;
  addService: (businessId: string, service: Omit<Service, 'id' | 'weekly_schedule'>) => void;
  addAppointment: (businessId: string, appointment: Omit<Appointment, 'id'>) => void;
  cancelAppointment: (appointmentId: string) => Promise<void>;
  updateUserProfile: (userId: string, profileData: Partial<CustomerProfile>) => Promise<void>;
  resetPassword: (userId: string, oldPassword: string, newPassword: string) => Promise<void>;
  getAppointmentsForUser: (userId: string) => Appointment[];
}

// For chat history
export interface ChatMessage {
    id: number;
    sender: 'human' | 'ai';
    text?: string; // The user's text input
    data?: ZypprResponse; // The AI's structured response
    initialPrompt?: string; // For pre-filling the input
}

// App Navigation
export type View = 'dashboard' | 'conversations' | 'calendar' | 'marketing' | 'services' | 'photos' | 'broadcast';
export type UserView = 'discover' | 'profile';

// Marketing component
export type SocialPlatform = 'Instagram' | 'Facebook' | 'Twitter';
export type PostTone = 'Promotional' | 'Informative' | 'Engaging';

export interface MarketingPost {
  id: number;
  text: string;
  imageUrl: string;
  platform: SocialPlatform;
  generatedAt: Date;
}
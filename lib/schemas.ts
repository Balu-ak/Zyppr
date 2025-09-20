import { z } from 'zod';

// --- Core Data Models ---

export const StudioPictureSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  caption: z.string(),
  is_demo: z.boolean().optional(),
});

export const AnnouncementSchema = z.object({
  id: z.string(),
  message: z.string(),
  timestamp: z.string(),
  is_demo: z.boolean().optional(),
});

export const PriceSchema = z.object({
  amount: z.number(),
  currency: z.string(),
});

export const ScheduleEntrySchema = z.object({
  day: z.string(), // e.g., "Monday"
  time: z.string(), // e.g., "10:30"
});


export const ServiceSchema = z.object({
  id: z.string().nullable(),
  name: z.string(),
  description: z.string().optional(),
  duration_minutes: z.number(),
  price: PriceSchema.optional(),
  category: z.string(),
  tags: z.array(z.string()).nullable().optional(),
  weekly_schedule: z.array(ScheduleEntrySchema).optional(),
  is_demo: z.boolean().optional(),
});

export const CustomerSchema = z.object({
  name: z.string(),
  email: z.string().email().nullable(),
  phone: z.string().nullable().optional(),
});

export const AppointmentSchema = z.object({
  id: z.string(),
  service_id: z.string().nullable().optional(),
  service_name: z.string(),
  customer: CustomerSchema,
  start_time: z.string(),
  end_time: z.string().nullable(),
  notes: z.string().nullable().optional(),
  status: z.enum(['pending', 'confirmed', 'cancelled']),
  is_demo: z.boolean().optional(),
});

export const BusinessCategoryEnum = z.enum(["Yoga", "Fitness", "Yoga & Fitness Center"]);
export const BusinessTypeEnum = z.enum(["Yoga Studio", "Gym Center", "Yoga & Fitness Center"]);


// --- Authentication & Profiles ---
export const CustomerProfileSchema = z.object({
  first_name: z.string(),
  last_name: z.string(),
  address: z.string(),
  zipcode: z.string(),
  apartment_number: z.string().optional().nullable(),
});

export const BusinessProfileSchema = z.object({
  business_name: z.string(),
  address: z.string(),
  zipcode: z.string(),
  category: BusinessCategoryEnum,
  pictures: z.array(StudioPictureSchema),
  announcements: z.array(AnnouncementSchema),
});

// FIX: Changed UserSchema to a discriminated union based on the 'role' property.
// This allows TypeScript to correctly infer the type of the 'profile' object
// based on whether the user is a 'user' or a 'business_owner', resolving type errors
// when accessing profile fields like 'first_name'.
export const UserSchema = z.discriminatedUnion("role", [
  z.object({
    id: z.string(),
    email: z.string().email(),
    password_hash: z.string(),
    role: z.literal("user"),
    profile: CustomerProfileSchema,
    businessId: z.string().optional(),
  }),
  z.object({
    id: z.string(),
    email: z.string().email(),
    password_hash: z.string(),
    role: z.literal("business_owner"),
    profile: BusinessProfileSchema,
    businessId: z.string().optional(),
  }),
]);

// --- ZYPPR AI CONTRACT ---

export const BusinessContextSchema = z.object({
  id: z.string().nullable(),
  name: z.string().nullable(),
  category: BusinessCategoryEnum.nullable(),
  address: z.string().nullable(),
  zipcode: z.string().nullable(),
  timezone: z.string().nullable().optional(),
});

export const BusinessSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: BusinessTypeEnum,
  zipcode: z.string(),
  address: z.string(),
  timezone: z.string(),
  pictures: z.array(StudioPictureSchema),
  announcements: z.array(AnnouncementSchema),
  services: z.array(ServiceSchema).optional(),
  appointments: z.array(AppointmentSchema).optional(),
  is_demo: z.boolean().optional(),
});


export const FiltersSchema = z.object({
  zipcode: z.string().nullable(),
  category: z.string().nullable(),
  date_from: z.string().nullable(),
  date_to: z.string().nullable(),
});

export const AuthRequestSchema = z.object({
    email: z.string().email().nullable().optional(),
    password: z.string().nullable().optional(),
    confirm_password: z.string().nullable().optional(),
    old_password: z.string().nullable().optional(),
    new_password: z.string().nullable().optional(),
    confirm_new_password: z.string().nullable().optional(),
}).nullable();

export const UserProfileRequestSchema = z.object({
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
    email: z.string().email().nullable().optional(),
    address: z.string().nullable().optional(),
    apartment_number: z.string().nullable().optional(),
    zipcode: z.string().nullable().optional(),
    phone: z.string().nullable().optional(),
}).nullable();

export const BusinessProfileRequestSchema = z.object({
    business_name: z.string().nullable().optional(),
    address: z.string().nullable().optional(),
    zipcode: z.string().nullable().optional(),
    category: BusinessCategoryEnum.nullable().optional(),
}).nullable();

export const ServiceRequestSchema = z.object({
    id: z.string().nullable().optional(),
    name: z.string().nullable().optional(),
    description: z.string().nullable().optional(),
    duration_minutes: z.number().nullable().optional(),
    price: PriceSchema.partial().nullable().optional(),
    category: z.string().nullable().optional(),
    tags: z.array(z.string()).nullable().optional(),
}).nullable();

export const AppointmentRequestSchema = z.object({
    id: z.string().nullable().optional(),
    service_id: z.string().nullable().optional(),
    service_name: z.string().nullable().optional(),
    customer: CustomerSchema.partial().nullable().optional(),
    start_time: z.string().nullable().optional(),
    end_time: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    status: z.enum(['pending', 'confirmed', 'cancelled']).nullable().optional(),
}).nullable();

export const MarketingRequestSchema = z.object({
    platform: z.enum(["Instagram", "Facebook", "Twitter"]).nullable().optional(),
    tone: z.enum(["Promotional", "Informative", "Engaging"]).nullable().optional(),
    caption: z.string().nullable().optional(),
    image_prompt: z.string().nullable().optional(),
}).nullable();

export const BroadcastRequestSchema = z.object({
    message: z.string().nullable().optional(),
    channel: z.enum(["email", "sms", "whatsapp", "dashboard"]).nullable().optional(),
}).nullable();


export const RequestPayloadSchema = z.object({
  auth: AuthRequestSchema.optional(),
  user_profile: UserProfileRequestSchema.optional(),
  business_profile: BusinessProfileRequestSchema.optional(),
  service: ServiceRequestSchema.optional(),
  appointment: AppointmentRequestSchema.optional(),
  filters: FiltersSchema.nullable().optional(),
  marketing: MarketingRequestSchema.optional(),
  broadcast: BroadcastRequestSchema.optional(),
}).nullable();

export const NotificationSchema = z.object({
  type: z.enum(['APPOINTMENT_CREATED', 'SERVICE_CREATED', 'SERVICE_UPDATED', 'SERVICE_DELETED']).nullable(),
  channels: z.array(z.enum(['dashboard', 'email', 'sms', 'whatsapp'])).nullable(),
  message: z.string().nullable(),
  data: z.object({
    appointment_id: z.string().nullable(),
    service_id: z.string().nullable(),
  }).nullable(),
});

export const DiscoveredBusinessSchema = z.object({
    id: z.string().nullable(),
    business_name: z.string(),
    business_type: BusinessTypeEnum,
    address: z.string(),
    zipcode: z.string(),
    photos: z.array(z.string().url()),
    services: z.array(ServiceSchema.omit({id: true, tags: true, is_demo: true})),
});

export const DemoBusinessSchema = DiscoveredBusinessSchema.omit({id: true}).extend({
    services: z.array(z.object({
        name: z.string(),
        description: z.string(),
        duration_minutes: z.number(),
        price: PriceSchema,
        category: z.string(),
    }))
});

export const AvailableSlotsSchema = z.object({
    service_name: z.string(),
    start_time: z.string(),
    end_time: z.string(),
});

export const ResponsePayloadSchema = z.object({
  assistant_reply: z.string().nullable().optional(),
  businesses: z.array(DiscoveredBusinessSchema).optional(),
  services: z.array(ServiceSchema).nullable().optional(),
  appointments: z.array(AppointmentSchema).nullable().optional(),
  available_slots: z.array(AvailableSlotsSchema).nullable().optional(),
  user_profile: CustomerProfileSchema.optional(),
  post: z.object({
      platform: z.enum(["Instagram", "Facebook", "Twitter"]).nullable(),
      caption: z.string().nullable(),
      image_url: z.string().url().nullable(),
  }).optional(),
  broadcast_result: z.object({
      message: z.string().nullable(),
      channel: z.enum(["email", "sms", "whatsapp", "dashboard"]).nullable(),
      status: z.enum(["queued", "sent", "failed"]).nullable(),
  }).optional(),
  notification: NotificationSchema.nullable().optional(),
  demo_businesses: z.array(DemoBusinessSchema).optional(),
  demo_services: z.array(z.preprocess(
      (val) => (typeof val === 'object' && val !== null && typeof (val as any).price === 'number')
          ? { ...val, price: { amount: (val as any).price, currency: 'USD' } }
          : val,
      ServiceSchema.omit({id: true, tags: true, is_demo: true})
  )).optional(),
  demo_appointments: z.array(z.object({
      customer_name: z.string().optional(),
      service: z.string().optional(),
      start_time: z.string(),
  })).optional(),
  demo_photos: z.array(z.string().url()).optional(),
  demo_broadcasts: z.array(z.object({ message: z.string() })).optional(),
  is_demo: z.boolean().optional(),
  missing_fields: z.array(z.string()).nullable().optional(),
  clarifying_questions: z.array(z.preprocess(item => String(item), z.string())).nullable().optional(),
  errors: z.array(z.string()).nullable().optional(),
});

export const OperationEnum = z.enum([
    "LOGIN", "SIGNUP", "VIEW_PROFILE", "UPDATE_PROFILE", "RESET_PASSWORD",
    "LIST_BUSINESSES", "LIST_SERVICES",
    "CREATE_SERVICE", "UPDATE_SERVICE", "DELETE_SERVICE",
    "LIST_APPOINTMENTS", "CREATE_APPOINTMENT",
    "GENERATE_POST", "BROADCAST_MESSAGE",
    "ASSIST"
]);

export const ZypprResponseSchema = z.object({
  operation: OperationEnum.optional(),
  role: z.enum(['user', 'business_owner']).optional(),
  status: z.enum(['success', 'failure']).optional(),
  business: BusinessContextSchema.optional(),
  request: RequestPayloadSchema.optional(),
  // CRITICAL FIX: The response object is now REQUIRED.
  // This enforces the AI contract strictly. If the AI fails to provide it,
  // Zod will now throw a validation error, which is caught by the geminiService
  // and turned into a user-friendly fallback response.
  response: ResponsePayloadSchema,
});
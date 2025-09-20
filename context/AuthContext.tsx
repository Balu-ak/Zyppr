import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User, Role, AuthContextType, Business, StudioPicture, Announcement, CustomerProfile, BusinessProfile, Service, Appointment } from '../types';

export const AuthContext = createContext<AuthContextType>({
  user: null,
  businesses: [],
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  getBusinessById: () => undefined,
  addPicture: () => {},
  addAnnouncement: () => {},
  addService: () => {},
  addAppointment: () => {},
  cancelAppointment: async () => {},
  updateUserProfile: async () => {},
  resetPassword: async () => {},
  getAppointmentsForUser: () => [],
});

// Helper to create a basic hash. In a real app, use a library like bcrypt.
const simpleHash = (s: string) => {
  let hash = 0;
  for (let i = 0; i < s.length; i++) {
    const char = s.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return hash.toString();
};

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Converts "HH:mm" to total minutes from midnight
const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// Generates a random, non-overlapping weekly schedule for a new service
const generateWeeklySchedule = (
    existingServices: Service[] = [],
    newServiceDuration: number
): { day: string; time: string }[] => {
    const bookedSlots: { start: number; end: number }[] = [];

    // Populate bookedSlots from existing services
    existingServices.forEach(service => {
        service.weekly_schedule?.forEach(slot => {
            const dayIndex = WEEKDAYS.indexOf(slot.day);
            if (dayIndex === -1) return;

            const startMinutes = (dayIndex * 24 * 60) + timeToMinutes(slot.time);
            const endMinutes = startMinutes + service.duration_minutes;
            bookedSlots.push({ start: startMinutes, end: endMinutes });
        });
    });

    const newSchedule: { day: string; time: string }[] = [];
    const scheduleSlots = Math.floor(Math.random() * 2) + 2; // Generate 2 or 3 slots

    for (let i = 0; i < scheduleSlots; i++) {
        let attempts = 0;
        while (attempts < 50) { // Limit attempts to prevent infinite loops
            const randomDayIndex = Math.floor(Math.random() * WEEKDAYS.length);
            const randomDay = WEEKDAYS[randomDayIndex];

            // 9 AM to 5 PM window.
            const minHour = 9;
            const maxPossibleStartHour = 17 - Math.ceil(newServiceDuration / 60);
            const randomHour = Math.floor(Math.random() * (maxPossibleStartHour - minHour + 1)) + minHour;
            const randomMinute = Math.random() < 0.5 ? 0 : 30;
            
            const randomTime = `${String(randomHour).padStart(2, '0')}:${String(randomMinute).padStart(2, '0')}`;
            
            const newStartMinutes = (randomDayIndex * 24 * 60) + timeToMinutes(randomTime);
            const newEndMinutes = newStartMinutes + newServiceDuration;
            
            // Check for overlap
            const isOverlapping = bookedSlots.some(slot =>
                (newStartMinutes < slot.end && newEndMinutes > slot.start)
            );

            if (!isOverlapping) {
                newSchedule.push({ day: randomDay, time: randomTime });
                bookedSlots.push({ start: newStartMinutes, end: newEndMinutes }); // Add to booked slots for next iteration
                break; // Found a valid slot, exit while loop
            }
            attempts++;
        }
    }

    return newSchedule.sort((a, b) => {
        const dayDiff = WEEKDAYS.indexOf(a.day) - WEEKDAYS.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return timeToMinutes(a.time) - timeToMinutes(b.time);
    });
};


const generateDemoBusinessesForZipcode = (zipcode: string): Business[] => {
    const yogaServices: Service[] = [
        { id: 'demo_svc_1', name: 'Vinyasa Flow', description: 'A dynamic flow class linking breath to movement.', duration_minutes: 60, price: { amount: 20, currency: 'USD' }, category: 'Yoga', tags:[], is_demo: true, weekly_schedule: [] },
        { id: 'demo_svc_2', name: 'Meditation Circle', description: 'A 30-minute guided meditation session.', duration_minutes: 30, price: { amount: 10, currency: 'USD' }, category: 'Meditation', tags:[], is_demo: true, weekly_schedule: [] },
    ];
    yogaServices[0].weekly_schedule = generateWeeklySchedule([], yogaServices[0].duration_minutes);
    yogaServices[1].weekly_schedule = generateWeeklySchedule([yogaServices[0]], yogaServices[1].duration_minutes);

    const gymServices: Service[] = [
         { id: 'demo_svc_3', name: 'Strength Training', description: 'A full-body circuit workout.', duration_minutes: 45, price: { amount: 30, currency: 'USD' }, category: 'Fitness', tags:[], is_demo: true, weekly_schedule: [] },
         { id: 'demo_svc_4', name: 'Personal Training', description: 'One-on-one session with a certified trainer.', duration_minutes: 60, price: { amount: 50, currency: 'USD' }, category: 'Fitness', tags:[], is_demo: true, weekly_schedule: [] },
    ];
    gymServices[0].weekly_schedule = generateWeeklySchedule([], gymServices[0].duration_minutes);
    gymServices[1].weekly_schedule = generateWeeklySchedule([gymServices[0]], gymServices[1].duration_minutes);


    return [
        {
            id: 'demo_biz_yoga_1',
            name: 'Serenity Now Yoga',
            timezone: 'America/New_York',
            type: 'Yoga Studio',
            zipcode: zipcode,
            address: `123 Wellness Way, Near you`,
            is_demo: true,
            pictures: [
                { id: 'demo_p1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=2120&auto=format&fit=crop', caption: 'Our serene main hall', is_demo: true },
                { id: 'demo_p2', url: 'https://images.unsplash.com/photo-1575052814086-0884931a20b4?q=80&w=2070&auto=format&fit=crop', caption: 'Join our community', is_demo: true }
            ],
            announcements: [],
            services: yogaServices,
        },
        {
            id: 'demo_biz_gym_1',
            name: 'Momentum Fitness Club',
            timezone: 'America/New_York',
            type: 'Gym Center',
            zipcode: zipcode,
            address: `456 Power St, Near you`,
            is_demo: true,
            pictures: [
                 { id: 'demo_p3', url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop', caption: 'State-of-the-art equipment', is_demo: true },
                 { id: 'demo_p4', url: 'https://images.unsplash.com/photo-1599058917212-d750089bc07e?q=80&w=2069&auto=format&fit=crop', caption: 'Push your limits', is_demo: true }
            ],
            announcements: [
                {id: 'demo_a1', message: 'Grand Opening Special! 20% off all memberships this month.', timestamp: new Date().toISOString(), is_demo: true }
            ],
            services: gymServices,
        }
    ];
};

const generateDemoDataForOwner = (category: BusinessProfile['category']): { services: Service[], appointments: Appointment[], pictures: StudioPicture[], announcements: Announcement[] } => {
    const data: { services: Service[], appointments: Appointment[], pictures: StudioPicture[], announcements: Announcement[] } = { services: [], appointments: [], pictures: [], announcements: [] };
    const now = new Date();
    
    if (category.includes('Yoga')) {
        data.pictures.push(
            { id: 'demo_p_y1', url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1999&auto=format&fit=crop', caption: 'Morning meditation session', is_demo: true },
            { id: 'demo_p_y2', url: 'https://images.unsplash.com/photo-1591291621222-2685a3a9?q=80&w=2070&auto=format&fit=crop', caption: 'Our beautiful studio space', is_demo: true },
        );
        const yogaServices: Service[] = [
            { id: 'demo_svc_y1', name: 'Vinyasa Flow', description: 'A dynamic flow class linking breath to movement.', duration_minutes: 60, price: { amount: 20, currency: 'USD' }, category: 'Yoga', tags:[], is_demo: true, weekly_schedule: [] },
            { id: 'demo_svc_y2', name: 'Restorative Yoga', description: 'Gentle poses for deep relaxation.', duration_minutes: 75, price: { amount: 25, currency: 'USD' }, category: 'Yoga', tags:[], is_demo: true, weekly_schedule: [] },
        ];
        yogaServices[0].weekly_schedule = generateWeeklySchedule([], yogaServices[0].duration_minutes);
        yogaServices[1].weekly_schedule = generateWeeklySchedule([yogaServices[0]], yogaServices[1].duration_minutes);
        data.services.push(...yogaServices);

        data.appointments.push({
            id: 'demo_appt_y1', service_id: 'demo_svc_y1', service_name: 'Vinyasa Flow', customer: { name: 'Jane Doe', email: 'jane@demo.com', phone: null}, start_time: new Date(now.setDate(now.getDate() + 2)).toISOString(), end_time: new Date(now.setHours(now.getHours() + 1)).toISOString(), notes: null, status: 'confirmed', is_demo: true
        });
    }
    
    if (category.includes('Fitness')) {
        data.pictures.push(
            { id: 'demo_p_g1', url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?q=80&w=1975&auto=format&fit=crop', caption: 'Fully equipped weight room', is_demo: true },
            { id: 'demo_p_g2', url: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop', caption: 'Cardio zone', is_demo: true },
        );
         data.announcements.push({ id: `ann_demo_${Date.now()}`, message: "Welcome to your new dashboard! Don't forget to update your services and business hours.", timestamp: new Date().toISOString(), is_demo: true });
        const gymServices: Service[] = [
             { id: 'demo_svc_g1', name: 'Personal Training', description: 'One-on-one session with a certified trainer.', duration_minutes: 60, price: { amount: 50, currency: 'USD' }, category: 'Fitness', tags:[], is_demo: true, weekly_schedule: [] },
        ];
        gymServices[0].weekly_schedule = generateWeeklySchedule(data.services, gymServices[0].duration_minutes);
        data.services.push(...gymServices);

        data.appointments.push({
            id: 'demo_appt_g1', service_id: 'demo_svc_g1', service_name: 'Personal Training', customer: { name: 'John Smith', email: 'john@demo.com', phone: null}, start_time: new Date(now.setDate(now.getDate() + 3)).toISOString(), end_time: new Date(now.setHours(now.getHours() + 1)).toISOString(), notes: 'Focus on strength.', status: 'confirmed', is_demo: true
        });
    }

    return data;
};


export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('zypprUserId');
    if (storedUserId) {
      // This is a mock persistence layer. In a real app, you'd fetch from an API.
      const allUsers = JSON.parse(localStorage.getItem('zypprAllUsers') || '[]');
      const allBusinesses = JSON.parse(localStorage.getItem('zypprAllBusinesses') || '[]');
      setUsers(allUsers);
      setBusinesses(allBusinesses);
      const foundUser = allUsers.find((u: User) => u.id === storedUserId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, []);

  const persistData = (newUsers: User[], newBusinesses: Business[]) => {
      localStorage.setItem('zypprAllUsers', JSON.stringify(newUsers));
      localStorage.setItem('zypprAllBusinesses', JSON.stringify(newBusinesses));
  };


  const login = async (email: string, password: string, role: Role): Promise<void> => {
    const foundUser = users.find(u => u.email === email && u.role === role);
    if (!foundUser) {
      throw new Error("User not found. Please check your email and role.");
    }
    if (foundUser.password_hash !== simpleHash(password)) {
      throw new Error("Invalid password.");
    }
    localStorage.setItem('zypprUserId', foundUser.id);
    setUser(foundUser);
    
    // If a user logs in and there are no REAL businesses, show them demos.
    const realBusinesses = businesses.filter(b => !b.is_demo)
    if (foundUser.role === 'user' && realBusinesses.length === 0) {
        const userProfile = foundUser.profile as CustomerProfile;
        const demoBusinesses = generateDemoBusinessesForZipcode(userProfile.zipcode);
        setBusinesses(demoBusinesses);
        // Do not persist demo businesses
    } else {
        setBusinesses(realBusinesses);
    }
  };

  const signup = async (role: Role, data: Record<string, string>): Promise<void> => {
    if (users.some(u => u.email === data.email)) {
      throw new Error("An account with this email already exists.");
    }
    
    let newUser: User;
    let newBusinessesState = [...businesses];

    if (role === 'user') {
      const requiredFields = ['first_name', 'last_name', 'email', 'address', 'zipcode', 'password', 'confirm_password'];
      const missingFields = requiredFields.filter(f => !data[f]);
      if (missingFields.length > 0) {
        throw new Error(`Missing mandatory fields: ${missingFields.join(', ')}`);
      }
      if (data.password !== data.confirm_password) {
        throw new Error("Passwords do not match.");
      }
      const profile: CustomerProfile = {
        first_name: data.first_name,
        last_name: data.last_name,
        address: data.address,
        zipcode: data.zipcode,
        apartment_number: data.apartment_number,
      };
      newUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        password_hash: simpleHash(data.password),
        role: 'user',
        profile,
      };

      if (businesses.filter(b => !b.is_demo).length === 0) {
        newBusinessesState = generateDemoBusinessesForZipcode(profile.zipcode);
      }

    } else { // business_owner
      const requiredFields = ['business_name', 'address', 'zipcode', 'email', 'password', 'category'];
      const missingFields = requiredFields.filter(f => !data[f]);
      if (missingFields.length > 0) {
        throw new Error(`Missing mandatory fields: ${missingFields.join(', ')}`);
      }
      
      const demoData = generateDemoDataForOwner(data.category as BusinessProfile['category']);

      const businessId = `biz_${Date.now()}`;
      
      const profile: BusinessProfile = {
        business_name: data.business_name,
        address: data.address,
        zipcode: data.zipcode,
        category: (data.category as any),
        pictures: demoData.pictures,
        announcements: demoData.announcements,
      };

      newUser = {
        id: `user_${Date.now()}`,
        email: data.email,
        password_hash: simpleHash(data.password),
        role: 'business_owner',
        profile,
        businessId: businessId,
      };
      
      const mapCategoryToType = (category: BusinessProfile['category']): Business['type'] => {
        switch (category) {
          case 'Yoga': return 'Yoga Studio';
          case 'Fitness': return 'Gym Center';
          case 'Yoga & Fitness Center': return 'Yoga & Fitness Center';
        }
      };

      const newBusiness: Business = {
        id: businessId,
        name: profile.business_name,
        type: mapCategoryToType(profile.category),
        timezone: 'America/New_York', // default
        zipcode: profile.zipcode,
        address: profile.address,
        pictures: demoData.pictures,
        announcements: demoData.announcements,
        services: demoData.services,
        appointments: demoData.appointments,
        is_demo: false, // This is a real business
      };
      newBusinessesState.push(newBusiness);
    }
    
    const newUsersState = [...users, newUser];
    setUsers(newUsersState);
    setBusinesses(newBusinessesState);
    persistData(newUsersState, newBusinessesState.filter(b => !b.is_demo)); // Don't persist demos

    localStorage.setItem('zypprUserId', newUser.id);
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('zypprUserId');
    setUser(null);
  };

  const getBusinessById = (id: string): Business | undefined => {
    return businesses.find(b => b.id === id);
  };
  
  const addPicture = (businessId: string, picture: Omit<StudioPicture, 'id'>) => {
    const newBusinesses = businesses.map(b => {
      if (b.id === businessId) {
        const newPic = { ...picture, id: `pic_${Date.now()}`, is_demo: false };
        return { ...b, pictures: [...b.pictures, newPic] };
      }
      return b;
    });
    setBusinesses(newBusinesses);
    persistData(users, newBusinesses);
  };
  
  const addAnnouncement = (businessId: string, message: string) => {
    const newBusinesses = businesses.map(b => {
      if (b.id === businessId) {
        const announcement: Announcement = { id: `ann_${Date.now()}`, message, timestamp: new Date().toISOString(), is_demo: false };
        return { ...b, announcements: [announcement, ...b.announcements] };
      }
      return b;
    });
    setBusinesses(newBusinesses);
    persistData(users, newBusinesses);
  };

  const addService = (businessId: string, service: Omit<Service, 'id' | 'weekly_schedule'>) => {
    const newBusinesses = businesses.map(b => {
      if (b.id === businessId) {
        const newSchedule = generateWeeklySchedule(b.services, service.duration_minutes);
        const newService = { ...service, id: `svc_${Date.now()}`, is_demo: false, weekly_schedule: newSchedule };
        const updatedServices = b.services ? [...b.services, newService] : [newService];
        return { ...b, services: updatedServices };
      }
      return b;
    });
    setBusinesses(newBusinesses);
    persistData(users, newBusinesses);
  };

  const addAppointment = (businessId: string, appointment: Omit<Appointment, 'id'>) => {
    const newBusinesses = businesses.map(b => {
      if (b.id === businessId) {
        const newAppointment = { ...appointment, id: `appt_${Date.now()}`, is_demo: false };
        const updatedAppointments = b.appointments ? [...b.appointments, newAppointment] : [newAppointment];
        return { ...b, appointments: updatedAppointments };
      }
      return b;
    });
    setBusinesses(newBusinesses);
     persistData(users, newBusinesses);
  };

  const cancelAppointment = async (appointmentId: string): Promise<void> => {
    let appointmentFoundAndCancelled = false;
    const newBusinesses = businesses.map(business => {
        if (business.appointments && !appointmentFoundAndCancelled) {
            const appointmentIndex = business.appointments.findIndex(app => app.id === appointmentId);
            if (appointmentIndex !== -1) {
                // Create a new array for immutability
                const updatedAppointments = [...business.appointments];
                // Create a new object for the updated appointment
                updatedAppointments[appointmentIndex] = {
                    ...updatedAppointments[appointmentIndex],
                    status: 'cancelled',
                };
                appointmentFoundAndCancelled = true;
                return { ...business, appointments: updatedAppointments };
            }
        }
        return business;
    });

    if (appointmentFoundAndCancelled) {
        setBusinesses(newBusinesses);
        persistData(users, newBusinesses.filter(b => !b.is_demo));
    } else {
        console.warn(`Appointment with ID ${appointmentId} not found for cancellation.`);
    }
  };

  const updateUserProfile = async (userId: string, profileData: Partial<CustomerProfile>): Promise<void> => {
    const newUsers = users.map(u => {
        if (u.id === userId && u.role === 'user') {
            const updatedProfile = { ...u.profile, ...profileData } as CustomerProfile;
            const updatedUser = { ...u, profile: updatedProfile };
            if(user?.id === userId) setUser(updatedUser); // Update active user state
            return updatedUser;
        }
        return u;
    });
    setUsers(newUsers);
    persistData(newUsers, businesses);
  };

  const resetPassword = async (userId: string, oldPassword: string, newPassword: string): Promise<void> => {
    const userToUpdate = users.find(u => u.id === userId);
    if (!userToUpdate) {
        throw new Error("User not found.");
    }
    if (userToUpdate.password_hash !== simpleHash(oldPassword)) {
        throw new Error("Incorrect old password.");
    }
    const newUsers = users.map(u => {
        if (u.id === userId) {
            return { ...u, password_hash: simpleHash(newPassword) };
        }
        return u;
    });
    setUsers(newUsers);
    persistData(newUsers, businesses);
  };

  const getAppointmentsForUser = (userId: string): Appointment[] => {
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser || currentUser.role !== 'user') return [];

    const userAppointments: Appointment[] = [];
    businesses.forEach(business => {
        if (business.appointments) {
            business.appointments.forEach(appointment => {
                // In a real app, customer ID would be used. Here, we match by email.
                if (appointment.customer.email === currentUser.email) {
                    // Add business name to appointment for display purposes
                    userAppointments.push({ ...appointment, service_name: `${appointment.service_name} at ${business.name}` });
                }
            });
        }
    });
    return userAppointments.sort((a,b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime());
  };

  return (
    <AuthContext.Provider value={{ user, businesses, login, signup, logout, getBusinessById, addPicture, addAnnouncement, addService, addAppointment, cancelAppointment, updateUserProfile, resetPassword, getAppointmentsForUser }}>
      {children}
    </AuthContext.Provider>
  );
};
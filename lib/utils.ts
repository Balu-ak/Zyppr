import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getNextDateForDay = (dayOfWeek: string, time: string): Date => {
    const dayMapping: { [key: string]: number } = { 'Sunday': 0, 'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6 };
    const targetDay = dayMapping[dayOfWeek];
    
    if (targetDay === undefined) {
        // Fallback for invalid day
        return new Date();
    }
    
    const [hours, minutes] = time.split(':').map(Number);
    
    const resultDate = new Date();
    resultDate.setHours(hours, minutes, 0, 0);
    
    const currentDay = resultDate.getDay();
    let dayDifference = targetDay - currentDay;

    // If the day is in the past for this week, or it's today but the time has passed, move to next week
    if (dayDifference < 0 || (dayDifference === 0 && resultDate.getTime() < new Date().getTime())) {
        dayDifference += 7;
    }
    
    resultDate.setDate(resultDate.getDate() + dayDifference);
    
    return resultDate;
};
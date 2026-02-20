export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    endDate?: Date;
    startTime?: string;
    endTime?: string;
    description?: string;
}

export interface DateInfo {
    day: number;
    month: number;
    year: number;
}
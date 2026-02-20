export interface CalendarEvent {
    id: string;
    title: string;
    date: Date;
    description?: string;
}

export interface DateInfo {
    day: number;
    month: number;
    year: number;
}
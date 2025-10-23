declare module 'react-big-calendar' {
  import * as React from 'react';

  export type View = 'month' | 'week' | 'work_week' | 'day' | 'agenda' | string;

  export interface Event {
    title?: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    resource?: any;
    [key: string]: any;
  }

  export interface CalendarProps {
    localizer?: any;
    events?: Event[];
    startAccessor?: string | ((event: Event) => Date);
    endAccessor?: string | ((event: Event) => Date);
    defaultView?: View;
    views?: View[] | { [K in View]?: any };
    step?: number;
    timeslots?: number;
    onSelectEvent?: (event: Event, e: React.SyntheticEvent) => void;
    onSelectSlot?: (slotInfo: any) => void;
    selectable?: boolean | 'ignoreEvents';
    date?: Date;
    defaultDate?: Date;
    onNavigate?: (date: Date, view?: View) => void;
    onView?: (view: View) => void;
    view?: View;
    culture?: string;
    style?: React.CSSProperties;
    components?: any;
    eventPropGetter?: (event: Event, start: Date, end: Date, isSelected: boolean) => any;
    slotPropGetter?: (date: Date) => any;
    [key: string]: any;
  }

  export const Views: { [key: string]: View };

  export class Calendar extends React.Component<CalendarProps> {}

  export function dateFnsLocalizer(config: any): any;

  export default Calendar;
}

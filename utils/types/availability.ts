interface TimeRanges {
    start: string;
    end: string;
}

interface Days {
    is_checked: boolean;
    time_ranges: Array<TimeRanges>;
}


export default interface Availability {
    weekdays: Array<Days>;
    created_at: Date;
    updated_at: Date;
}

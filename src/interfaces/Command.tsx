export default interface Command {
    validated: boolean;
    validation_date: string|null;
    travel_info: {
        train_ref: string;
        departure: string;
        arrival: string;
        departure_date: string;
        departure_time: string;
        arrival_date: string;
        arrival_time: string;
        options : string[];
        price: number;
        seat: string;
    }
}
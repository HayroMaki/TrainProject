import Travel from "./Travel.tsx";

export default interface Command {
    validated: boolean;
    validation_date: string|null;
    options : string[];
    travel_info: Travel;
}
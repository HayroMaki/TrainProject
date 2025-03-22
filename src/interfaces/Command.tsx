import Travel from "./Travel.tsx";
import {Option} from "./Option.tsx";

export default interface Command {
    validated: boolean;
    validation_date: string|null;
    options : Option[];
    travel_info: Travel;
}
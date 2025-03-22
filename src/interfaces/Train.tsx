import {Option} from "./Option.tsx";

export default interface Train {
    train_ref: string;
    wagons: number[];
    restaurant_wagon: number;
    floors: number;
    available_options: Option[];
}
import {CalendarContent} from "./CalendarContent.tsx";
import {CalendarMonthDisplayer} from "./CalendarMonthDisplayer.tsx";
import {useState} from "react";

export const CalendarDisplayer = () => {

    const [month, setMonth] = useState<number>(new Date().getMonth());

    function monthChangeHandler(isIncrement: boolean) {
        if (isIncrement) {
            if (month === 11) {
                setMonth(0);
            } else {
                setMonth(month + 1);
            }
        } else {
            if (month === 0) {
                setMonth(11);
            } else {
                setMonth(month - 1);
            }

        }
    }

    return (
        <div className="CalendarDisplayer">
            <CalendarMonthDisplayer month={month} monthChangeHandler={monthChangeHandler} />
            <CalendarContent month={month} />
        </div>
    )
}
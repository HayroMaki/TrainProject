export const CalendarMonthDisplayer = (props: {
    month: number;
    monthChangeHandler(isIncrement: boolean): void;
}) => {

    const MONTHS = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

    return (
        <div className="CalendarMonthDisplayer">
            <button className="MonthChanger" onClick={() => { props.monthChangeHandler(false) }}>{"<"}</button>
            <span className="MonthName">{MONTHS.at(props.month)}</span>
            <button className="MonthChanger" onClick={() => { props.monthChangeHandler(true) }}>{">"}</button>
        </div>
    )
}
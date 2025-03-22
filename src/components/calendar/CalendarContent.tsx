export const CalendarContent = (props: {
    month: number;
    year: number;
}) => {

    const options = { weekday: "short" }
    const startdate = new Date(props.year, props.month, 1);
    const enddate = new Date(props.year, props.month + 1, -1);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const startday = Intl.DateTimeFormat("fr-FR", options).format(startdate);
    const endday = enddate.getDate() + 1;

    const days = ["lun.", "mar.", "mer.", "jeu.", "ven.", "sam.", "dim."];

    const calendarDays = [];
    let isPassed = false;
    let monthDay = 1;
    let week: (number|null)[] = [];

    for (let i = 1; i <= 42; i++) {
        if (! (isPassed || startday === "lun.")) {
            // The month hasn't started yet
            if (days[i % 7] === startday) {
                isPassed = true;
            }
            week.push(null);
            continue;
        } else if (monthDay > endday) {
            // The month is exceeded
            week.push(null);
        } else {
            // The month started
            week.push(monthDay);
            monthDay++;
        }

        if (i % 7 === 0) {
            // A new week started
            calendarDays.push(week);
            week = []
        }
    }

    return (
        <table>
            <thead>
                <tr>
                    <th>Lun</th>
                    <th>Mar</th>
                    <th>Mer</th>
                    <th>Jeu</th>
                    <th>Ven</th>
                    <th>Sam</th>
                    <th>Dim</th>
                </tr>
            </thead>
            <tbody>
            {
                calendarDays.map((week, i) => {
                    return (
                        <tr key={i}>
                            { week.map((day, j) => {
                                return (
                                    <td key={j}>{day}</td>
                                )
                            })}
                        </tr>
                    )
                })
            }
            </tbody>
        </table>
    )
}
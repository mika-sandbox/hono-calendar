# 🔥 Hono Calendar

The Headless Calendar Library for HonoX, build without React dependencies.

## Installation

```bash
$ npm install hono honox @ohmyteeth/hono-calendar
```

## Usage

```tsx
import { format } from "date-fns";
import { useState } from "hono/jsx";
import * as HonoCalendar from "@ohmyteeth/hono-calendar";

const CalendarApp = () => {
  const [value, setValue] = useState(new Date());
  console.log({ value });

  return (
    <HonoCalendar.Root locale="ja-JP" onChange={setValue}>
      <div>
        <HonoCalendar.NavigateButton direction="prev">Prev</HonoCalendar.NavigateButton>
        <HonoCalendar.DisplayMonth render={(d) => format(d, "yyyy/MM")} />
        <HonoCalendar.NavigateButton direction="next">Next</HonoCalendar.NavigateButton>
      </div>
      <div>
        <HonoCalendar.Weekdays render={(day) => <div>{day}</div>} />
      </div>
      <div>
        <HonoCalendar.Rows
          row={(row) => <HonoCalendar.CalendarRow className="grid grid-cols-7 h-[72px] items-center">{row}</HonoCalendar.CalendarRow>}
          cell={(cell) => <HonoCalendar.CalendarCell cell={cell}>{cell.day}</HonoCalendar.CalendarCell>}
        />
      </div>
    </HonoCalendar.Root>
  );
};

export { CalendarApp };
```

### Common Props

- `className?` (`string`) - The classNames to apply to the element.

### `Root` Props

- `locale` (`string`) - The locale to use for the calendar.
- `children?` (`ReactNode`) - The children to render.
- `firstDayOfWeek?` (`DayOfWeek`) - The first day of the week.
- `initialValue?` (`Date`) - The initial select value of the calendar.
- `onChange?` (`(date|null) => void`) - The function to call when the value changes.

### `NavigateButton` Props

- `direction` (`"prev"|"next"`) - The direction of the button.
- `children?` (`ReactNode`) - The children to render.
- `isDisableCallback?` : (`(date: Date) => boolean`) - The function to call when the button is disabled.
- `onNavigate?`: (`() => void`) - The function to call when the button is clicked, invoked after the navigated.

### `DisplayMonth` Props

- `render` (`(date: Date) => ReactNode`) - The function to render the month.

### `Weekdays` Props

- `render` (`(day: string) => ReactNode`) - The function to render the day of the week.

### `Rows` Props

- `row` (`(row: ReactNode) => ReactNode`) - The function to render the row.
- `cell` (`(cell: CalendarCellProps) => ReactNode`) - The function to render the cell.

### `Row` Props

- `children` (`ReactNode`) - The children to render.

### `Cell` Props

- `cell` (`CalendarCellProps`) - The cell props.
- `children` (`ReactNode`) - The children to render.
- `isSelectable?` (`(CalendarCellCallbackProps) => boolean`) - The function to call when the cell is selectable.
- `isDisabled?` (`(CalendarCellCallbackProps) => boolean`) - The function to call when the cell is selected.

## License

This software is licensed under the Apache 2.0 License.

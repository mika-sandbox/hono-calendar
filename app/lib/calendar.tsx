import {
  type CalendarDate,
  DateFormatter,
  type DateValue,
  type DayOfWeek,
  createCalendar,
  fromDate,
  getWeeksInMonth,
  isSameDay,
  startOfMonth,
  startOfWeek,
  toCalendar,
  toCalendarDate,
  today,
} from "@internationalized/date";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Fragment, createContext, createElement, forwardRef, useContext, useMemo, useState } from "hono/jsx";

// ---- CalendarState.ts ----
// ref: https://github.com/adobe/react-spectrum/blob/main/packages/%40react-stately/calendar/src/useCalendarState.ts
type CalendarStateArgs = {
  locale: string;
  defaultValue?: DateValue;
  firstDayOfWeek?: DayOfWeek;
  onChange?: (date: Date | null) => void;
};

interface CalendarState {
  value: CalendarDate | null;
  setValue: (value: CalendarDate | null) => void;
  focusedValue: CalendarDate;
  timezone: string;
  weekDays: string[];
  weeksInMonth: number;
  toNext: () => void;
  toPrev: () => void;
  getDatesInWeek: (index: number) => CalendarDate[] | null;
}

const useCalendarState = (args: CalendarStateArgs) => {
  const formatter = useMemo(() => new DateFormatter(args.locale, { weekday: "narrow" }), [args.locale]);
  const resolvedOptions = useMemo(() => formatter.resolvedOptions(), [formatter]);
  const [value, setValue] = useState(args.defaultValue ?? null);
  const timezone = useMemo(() => resolvedOptions.timeZone, [resolvedOptions.timeZone]);
  const calendar = useMemo(() => createCalendar(resolvedOptions.calendar), [resolvedOptions.calendar]);
  const calendarValue = useMemo(() => (value ? toCalendar(toCalendarDate(value), calendar) : null), [value, calendar]);
  const [focusedValue, setFocusedValue] = useState(() => calendarValue || toCalendar(today(timezone), calendar));
  const [startDate, setStartDate] = useState(() => startOfMonth(focusedValue));
  const weekDays = useMemo(() => {
    const start = startOfWeek(focusedValue, args.locale, args.firstDayOfWeek);
    return Array.from({ length: 7 }, (_, i) => {
      const date = start.add({ days: i });
      return formatter.format(date.toDate(timezone));
    });
  }, [focusedValue, args.locale, args.firstDayOfWeek, formatter, timezone]);
  const weeksInMonth = useMemo(() => getWeeksInMonth(startDate, args.locale, args.firstDayOfWeek), [startDate, args.locale, args.firstDayOfWeek]);

  return {
    value: calendarValue,
    setValue: (val) => {
      setValue(val ? toCalendar(toCalendarDate(val), calendar) : null);
      setStartDate(startOfMonth(val || focusedValue));
      setFocusedValue(val || focusedValue);
      args.onChange?.(val?.toDate(timezone) ?? null);
    },
    focusedValue,
    timezone,
    weekDays,
    weeksInMonth,
    toNext: () => {
      const start = startDate.add({ months: 1 });
      setStartDate(start);
      setFocusedValue(start);
    },
    toPrev: () => {
      const start = startDate.subtract({ months: 1 });
      setStartDate(start);
      setFocusedValue(start);
    },
    getDatesInWeek: (index: number) => {
      const week = startDate.add({ weeks: index });
      const start = startOfWeek(week, args.locale, args.firstDayOfWeek);

      return Array.from({ length: 7 }, (_, i) => start.add({ days: i }));
    },
  } satisfies CalendarState;
};

// ---- SuppressWarnings.tsx ----
type ReactNode = unknown;

// ---- CalendarContext.ts ----
interface CalendarContextState {
  state: CalendarState | null;
}

const CalendarContext = createContext<CalendarContextState>({ state: null });

// ---- CalendarNavigateButton.tsx ----

type NavigateButtonProps = {
  direction: "prev" | "next";
  className?: string;
  children?: ReactNode;
  isDisabledCallback?: (date: Date) => boolean;
};

const CalendarNavigateButton = forwardRef<HTMLButtonElement, NavigateButtonProps>((props, ref) => {
  const { direction, children, isDisabledCallback, ...rest } = props;
  const { state } = useContext(CalendarContext);
  const handler = state ? (direction === "prev" ? state.toPrev : state.toNext) : () => {};
  const isDisabled = useMemo(() => {
    if (!state?.focusedValue) {
      return true;
    }

    const val = startOfMonth(state.focusedValue).add({ months: direction === "prev" ? -1 : 1 });
    return isDisabledCallback ? isDisabledCallback(val.toDate(state.timezone)) : false;
  }, [state?.focusedValue, direction, state?.timezone, isDisabledCallback]);

  return (
    <button ref={ref} {...rest} onClick={handler} disabled={isDisabled}>
      {children ? children : direction === "prev" ? "Previous" : "Next"}
    </button>
  );
});

// ---- CalendarNow.tsx ----

type DisplayMonthProps = {
  className?: string;
  render?: (date: Date) => ReactNode;
};

const CalendarDisplayMonth = forwardRef<HTMLDivElement, DisplayMonthProps>((props, ref) => {
  const { render, ...rest } = props;
  const { state } = useContext(CalendarContext);

  return state ? (
    <div ref={ref} {...rest}>
      {render?.(state.focusedValue.toDate(state.timezone)) ?? `${state.focusedValue.year}年${state.focusedValue.month + 1}月`}
    </div>
  ) : (
    <></>
  );
});

// ---- CalendarWeekdays.tsx ----

type WeekdaysProps = {
  className?: string;
  render?: (day: string) => ReactNode;
};

const CalendarWeekdays = forwardRef<HTMLDivElement, WeekdaysProps>((props, ref) => {
  const { render, ...rest } = props;
  const { state } = useContext(CalendarContext);

  return state ? (
    <div ref={ref} {...rest}>
      {state.weekDays.map((day) => (
        <div key={day}>{render?.(day) ?? day}</div>
      ))}
    </div>
  ) : (
    <></>
  );
});

// ---- CalendarRows.tsx ----

type CalendarRenderingCellProps = {
  date: CalendarDate;
  day: number;
};

type CalendarRowsProps = {
  className?: string;
  row?: (row: ReactNode) => ReactNode;
  cell?: (cell: CalendarRenderingCellProps) => ReactNode;
};

const CalendarRows = forwardRef<HTMLDivElement, CalendarRowsProps>((props, ref) => {
  const { row, cell, ...rest } = props;
  const { state } = useContext(CalendarContext);

  return state ? (
    <div ref={ref} {...rest}>
      {Array.from({ length: state.weeksInMonth }, (_, i) => {
        const dates = state.getDatesInWeek(i);
        if (dates === null) {
          return null;
        }

        const cells = dates.map((date) => {
          const props = { date, day: date.day } satisfies CalendarRenderingCellProps;
          return cell?.(props) ?? date.day;
        });

        return row?.(cells) ?? <div key={dates[0]}>{cells}</div>;
      })}
    </div>
  ) : (
    <></>
  );
});

// ---- CalendarRow.tsx ----

type CalendarRowProps = {
  children?: ReactNode;
  className?: string;
};

const CalendarRow = forwardRef<HTMLDivElement, CalendarRowProps>((props, ref) => {
  const { ...rest } = props;

  return <div ref={ref} {...rest} />;
});

// ---- CalendarCell.tsx ----

type CalendarCellCallbackProps = {
  date: Date;
};

type CalendarCellProps = {
  cell: CalendarRenderingCellProps;
  children?: ReactNode;
  className?: string;
  isSelectable?: (args: CalendarCellCallbackProps) => boolean;
  isDisabled?: (args: CalendarCellCallbackProps) => boolean;
};

const CalendarCell = forwardRef<HTMLButtonElement, CalendarCellProps>((props, ref) => {
  const { cell, isSelectable, isDisabled, ...rest } = props;
  const { state } = useContext(CalendarContext);
  const args = useMemo(() => {
    if (state?.timezone) {
      return { date: cell.date.toDate(state.timezone) } satisfies CalendarCellCallbackProps;
    }

    throw new Error("CalendarCell must be used within a CalendarContext");
  }, [cell, state?.timezone]);
  const handler = isSelectable?.(args) ? () => state?.setValue(cell.date) : () => {};
  const disabled = isDisabled?.(args) || false;
  const active = state?.value ? isSameDay(cell.date, state?.value) : false;

  return <button ref={ref} {...rest} onClick={handler} disabled={disabled} data-active={active} />;
});

// ---- CalendarRoot.tsx ----

type CalendarRootProps = {
  // properties
  locale: string;
  children?: ReactNode;
  className?: string;
  firstDayOfWeek?: DayOfWeek;
  initialValue?: Date;

  // event handlers
  onChange?: (date: Date | null) => void;
};

const Calendar = forwardRef<HTMLDivElement, CalendarRootProps>((props, ref) => {
  const { locale, firstDayOfWeek, initialValue, onChange, ...rest } = props;
  const state = useCalendarState({
    locale,
    firstDayOfWeek,
    defaultValue: initialValue ? fromDate(initialValue, locale) : undefined,
    onChange,
  });

  return (
    <CalendarContext.Provider value={{ state }}>
      <div ref={ref} {...rest} />
    </CalendarContext.Provider>
  );
});

// ---- index.tsx ----

const Root = Calendar;
const NavigateButton = CalendarNavigateButton;
const DisplayMonth = CalendarDisplayMonth;
const Weekdays = CalendarWeekdays;
const Rows = CalendarRows;
const Row = CalendarRow;
const Cell = CalendarCell;

export {
  Calendar,
  CalendarNavigateButton,
  CalendarDisplayMonth,
  CalendarWeekdays,
  CalendarRows,
  CalendarRow,
  CalendarCell,

  //
  Root,
  NavigateButton,
  DisplayMonth,
  Weekdays,
  Rows,
  Row,
  Cell,
};

export type { NavigateButtonProps };

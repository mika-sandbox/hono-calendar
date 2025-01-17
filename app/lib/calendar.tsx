import { type CalendarDate, DateFormatter, type DateValue, createCalendar, startOfMonth, startOfWeek, toCalendar, toCalendarDate, today } from "@internationalized/date";
import { format as f } from "date-fns";

import { createContext, forwardRef, useContext, useMemo, useState } from "hono/jsx";

// ---- CalendarState.ts ----
// ref: https://github.com/adobe/react-spectrum/blob/main/packages/%40react-stately/calendar/src/useCalendarState.ts
type CalendarStateArgs = {
  locale: string;
  defaultValue?: DateValue;
};

interface CalendarState {
  value: CalendarDate | null;
  setValue: (value: CalendarDate | null) => void;
  focusedValue: CalendarDate;
  timezone: string;
  weekDays: string[];
  toNext: () => void;
  toPrev: () => void;
}

const useCalendarState = (args: CalendarStateArgs) => {
  const formatter = useMemo(() => new DateFormatter(args.locale, { weekday: "narrow" }), [args.locale]);
  const resolvedOptions = useMemo(() => formatter.resolvedOptions(), [formatter]);
  const [value, setValue] = useState(args.defaultValue ?? null);
  const timezone = useMemo(() => resolvedOptions.timeZone, [resolvedOptions.timeZone]);
  const calendar = useMemo(() => createCalendar(resolvedOptions.calendar), [resolvedOptions.calendar]);
  const calendarValue = useMemo(() => (value ? toCalendar(toCalendarDate(value), calendar) : null), [value, calendar]);
  const focusedValue = useMemo(() => calendarValue || toCalendar(today(timezone), calendar), [calendarValue, timezone, calendar]);
  const [startDate, setStartDate] = useState(() => startOfMonth(focusedValue));
  const weekDays = useMemo(() => {
    const start = startOfWeek(focusedValue, args.locale);
    return Array.from({ length: 7 }, (_, i) => {
      const date = start.add({ days: i });
      return formatter.format(date.toDate(timezone));
    });
  }, [focusedValue, args.locale, formatter, timezone]);

  return {
    value: calendarValue,
    setValue,
    focusedValue,
    timezone,
    weekDays,
    toNext: () => {
      const start = startDate.add({ months: 1 });
      setStartDate(start);
      setValue(start);
    },
    toPrev: () => {
      const start = startDate.subtract({ months: 1 });
      setStartDate(start);
      setValue(start);
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

type NowProps = {
  format?: string;
  className?: string;
};

const CalendarNow = forwardRef<HTMLDivElement, NowProps>((props, ref) => {
  const { format, ...rest } = props;
  const { state } = useContext(CalendarContext);

  return state ? (
    <div ref={ref} {...rest}>
      {f(state.focusedValue.toDate(state.timezone), format ?? "yyyy-MM-dd")}
    </div>
  ) : (
    <></>
  );
});

// ---- CalendarWeekdays.tsx ----

type WeekdaysProps = {
  className?: string;
  renderWeekday?: (day: string) => ReactNode;
};

const CalendarWeekdays = forwardRef<HTMLDivElement, WeekdaysProps>((props, ref) => {
  const { renderWeekday, ...rest } = props;
  const { state } = useContext(CalendarContext);

  return state ? (
    <div ref={ref} {...rest}>
      {state.weekDays.map((day) => (
        <div key={day}>{renderWeekday?.(day) ?? day}</div>
      ))}
    </div>
  ) : (
    <></>
  );
});

// ---- CalendarRoot.tsx ----

type CalendarRootProps = {
  locale: string;
  children?: ReactNode;
  className?: string;
};

const Calendar = forwardRef<HTMLDivElement, CalendarRootProps>((props, ref) => {
  const { locale, ...rest } = props;
  const state = useCalendarState({ locale });

  console.log("debugger", state);

  return (
    <CalendarContext.Provider value={{ state }}>
      <div ref={ref} {...rest} />
    </CalendarContext.Provider>
  );
});

// ---- index.tsx ----

const Root = Calendar;
const NavigateButton = CalendarNavigateButton;
const Now = CalendarNow;
const Weekdays = CalendarWeekdays;

export {
  Calendar,
  CalendarNavigateButton,
  CalendarNow,
  CalendarWeekdays,

  //
  Root,
  NavigateButton,
  Now,
  Weekdays,
};

export type { NavigateButtonProps };

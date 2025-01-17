import { useCallback } from "hono/jsx";
import * as HonoCalendar from "../lib/calendar";

const NavigateButton = (props: HonoCalendar.NavigateButtonProps) => {
  return (
    <HonoCalendar.NavigateButton className="group flex space-x-2 text-[#f64850] disabled:text-[#ccc] min-w-[44px] text-xl font-bold" {...props}>
      {props.direction === "prev" ? <span>&lt;</span> : null}
      <span className="underline group-disabled:no-underline">{props.direction === "prev" ? "前の月" : "次の月"}</span>
      {props.direction === "next" ? <span>&gt;</span> : null}
    </HonoCalendar.NavigateButton>
  );
};

const Calendar = () => {
  const isDisabledToGoPrev = useCallback((d: Date) => d.getFullYear() < 2025, []);
  const isDisabledToGoNext = useCallback(() => false, []);

  return (
    <HonoCalendar.Root locale="ja-JP" className="w-[468px] mx-auto">
      <div className="flex items-center justify-between h-12">
        <NavigateButton direction="prev" isDisabledCallback={isDisabledToGoPrev} />
        <HonoCalendar.Now className="font-bold text-2xl select-none" format="yyyy年M月" />
        <NavigateButton direction="next" isDisabledCallback={isDisabledToGoNext} />
      </div>
      <div>
        <HonoCalendar.Weekdays
          className="grid grid-cols-7 h-[60px] text-2xl items-center justify-center"
          renderWeekday={(day) => <div className="flex items-center justify-center font-bold select-none">{day}</div>}
        />
      </div>
    </HonoCalendar.Root>
  );
};

export { Calendar };

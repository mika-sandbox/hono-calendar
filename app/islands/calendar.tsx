import { format } from "date-fns";
import { useCallback, useState } from "hono/jsx";
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
  const [state, setState] = useState<Date | null>(null);
  const isDisabledToGoPrev = useCallback((d: Date) => d.getFullYear() < 2025, []);
  const isDisabledToGoNext = useCallback(() => false, []);
  const isSelectable = useCallback(({ date: d }: { date: Date }) => {
    if (d.getMonth() === 0) {
      return d.getDate() >= 19;
    }

    return d.getMonth() === 1;
  }, []);
  const isDisabled = useCallback(({ date: d }: { date: Date }) => !isSelectable({ date: d }), [isSelectable]);

  return (
    <div className="container mx-auto flex flex-col space-y-2">
      <div>選択日時：{state ? format(state, "yyyy年M月d日") : "(null)"}</div>

      <HonoCalendar.Root locale="ja-JP" firstDayOfWeek="mon" className="w-[468px]" onChange={setState}>
        <div className="flex items-center justify-between h-12">
          <NavigateButton direction="prev" isDisabledCallback={isDisabledToGoPrev} />
          <HonoCalendar.DisplayMonth className="font-bold text-2xl select-none" render={(d) => format(d, "yyyy年M月")} />
          <NavigateButton direction="next" isDisabledCallback={isDisabledToGoNext} />
        </div>
        <div>
          <HonoCalendar.Weekdays
            className="grid grid-cols-7 h-[60px] text-2xl items-center justify-center"
            render={(day) => <div className="flex items-center justify-center font-bold select-none">{day}</div>}
          />
        </div>
        <div>
          <HonoCalendar.Rows
            row={(row) => <HonoCalendar.CalendarRow className="grid grid-cols-7 h-[72px] items-center">{row}</HonoCalendar.CalendarRow>}
            cell={(cell) => (
              <HonoCalendar.CalendarCell
                className="group flex items-center justify-center h-[72px] text-2xl font-bold text-[#f64850] data-[active]:text-white disabled:text-[#ccc] bg- rounded-full"
                cell={cell}
                isSelectable={isSelectable}
                isDisabled={isDisabled}
              >
                <div className="flex items-center justify-center h-[60px] w-[60px] rounded-full bg-[#fff8f8] group-data-[active]:bg-[#f64850] border border-[#f64850] group-disabled:bg-transparent group-disabled:border-none">
                  {cell.day}
                </div>
              </HonoCalendar.CalendarCell>
            )}
          />
        </div>
      </HonoCalendar.Root>
    </div>
  );
};

export { Calendar };

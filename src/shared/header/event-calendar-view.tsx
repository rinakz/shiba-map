import { IconButton } from "../ui";
import { IconPawButton, IconRight } from "../icons";
import stls from "./event-calendar.module.sass";
import { dayKey, dayStart, formatMonth, isSameDay } from "./event-calendar.utils";

type EventCalendarViewProps = {
  currentMonth: Date;
  selectedDay: Date;
  daysGrid: Date[];
  daysWithEvents: Set<string>;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDay: (day: Date) => void;
};

export const EventCalendarView = ({
  currentMonth,
  selectedDay,
  daysGrid,
  daysWithEvents,
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}: EventCalendarViewProps) => {
  return (
    <>
      <div className={stls.top}>
        <div className={stls.monthTitle}>{formatMonth(currentMonth)}</div>
        <div className={stls.monthNav}>
          <IconButton
            icon={
              <span style={{ display: "inline-flex", transform: "rotate(180deg)" }}>
                <IconRight />
              </span>
            }
            onClick={onPrevMonth}
          />
          <IconButton icon={<IconRight />} onClick={onNextMonth} />
        </div>
      </div>
      <div className={stls.calendarGrid}>
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((w) => (
          <div className={stls.weekday} key={w}>
            {w}
          </div>
        ))}
        {daysGrid.map((d) => {
          const inMonth = d.getMonth() === currentMonth.getMonth();
          const selected = isSameDay(d, selectedDay);
          const hasEvents = daysWithEvents.has(dayKey(d));
          return (
            <button
              key={d.toISOString()}
              className={`${stls.dayCell} ${!inMonth ? stls.dayMuted : ""} ${selected ? stls.daySelected : ""} ${hasEvents ? stls.dayHasEvents : ""}`}
              onClick={() => onSelectDay(dayStart(d))}
            >
              <span className={stls.dayNum}>{d.getDate()}</span>
              {hasEvents && (
                <span className={stls.paw}>
                  <IconPawButton />
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className={stls.eventsTitle}>
        {selectedDay.toLocaleDateString("ru-RU", { day: "2-digit", month: "long" })}
      </div>
    </>
  );
};

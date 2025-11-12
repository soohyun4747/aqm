// components/DatePicker.tsx
import { useRef } from 'react';
import { Calendar } from './icons/Calendar';
import { formatDate } from '@/src/utils/date';

interface DatePickerProps {
  date: Date;
  label?: string;
  onChange: (date: Date) => void;
  isDateDisabled?: (d: Date) => boolean;
  onInvalidSelect?: (d: Date) => void;
  /** 사용자가 다른 달의 '날짜'를 선택했을 때 호출 (YYYY, monthIndex[0-11]) */
  onMonthChange?: (year: number, month0to11: number) => void; // ⬅️ 추가
}

export function DatePicker(props: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const ymd = (d: Date) =>
    `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d
      .getDate()
      .toString()
      .padStart(2, '0')}`;

  const handleChangeDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // "YYYY-MM-DD"
    const [year, month, day] = value.split('-').map(Number);

    const prevDate = props.date;
    const newDate = new Date(prevDate);
    newDate.setFullYear(year, month - 1, day); // 시간/분/초 유지

    // 금지 날짜면 롤백 + 알림
    if (props.isDateDisabled?.(newDate)) {
      if (inputRef.current) inputRef.current.value = ymd(prevDate);
      props.onInvalidSelect?.(newDate);
      return;
    }

    // 달이 바뀌었으면 콜백 호출
    if (
      props.onMonthChange &&
      (year !== prevDate.getFullYear() || month - 1 !== prevDate.getMonth())
    ) {
      props.onMonthChange(year, month - 1);
    }

    props.onChange(newDate);
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.showPicker?.();
      inputRef.current.focus();
    }
  };

  return (
    <div className="flex flex-col gap-2 flex-1 self-stretch">
      <p className="text-Gray-900 body-md-medium">{props.label ?? '날짜'}</p>
      <div
        onClick={handleClick}
        className="flex items-center gap-[10px] border border-Gray-300 rounded-[8px] bg-Gray-50 px-4 py-3 relative"
      >
        <Calendar fill="#6B7280" />
        <p className="text-Gray-500 body-md-regular">{formatDate(props.date)}</p>
        <input
          ref={inputRef}
          type="date"
          defaultValue={ymd(props.date)}
          onChange={handleChangeDate}
          className="absolute opacity-0 w-full h-full cursor-pointer"
          style={{ left: 0, top: 0 }}
          tabIndex={-1}
        />
      </div>
    </div>
  );
}

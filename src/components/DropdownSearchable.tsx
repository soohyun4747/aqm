import { useState, useRef, useEffect, useMemo, CSSProperties } from 'react';
import { ChevronDown } from './icons/ChevronDown';

interface DropdownProps {
  label: string;
  options: Option[];
  value: string;
  id: string;
  isMandatory?: boolean;
  style?: CSSProperties;
  className?: string;
  onChange?: (value: string) => void;

  // ✅ 추가 옵션
  searchPlaceholder?: string;
  noResultsText?: string;
  clearable?: boolean; // 선택값 지우기 버튼
}

export interface Option {
  value: string;
  label?: string;
  // 필요시 메타 필드 확장 가능
}

export function DropdownSearchable(props: DropdownProps) {
  const {
    label,
    options,
    value,
    id,
    isMandatory,
    style,
    className,
    onChange,
    searchPlaceholder = '검색하세요...',
    noResultsText = '검색 결과가 없습니다.',
    clearable = false,
  } = props;

  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<'up' | 'down'>('down');
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState<number>(-1); // 키보드 포커스용
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((o) => o.value === value)?.label ?? '선택하세요';

  // 필터링 (간단 부분 문자열 매칭, label 없으면 value 기준)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => {
      const t = (o.label ?? o.value).toLowerCase();
      return t.includes(q);
    });
  }, [options, query]);

  // 드롭다운 열릴 때 방향 계산 + 인풋 포커스
  useEffect(() => {
    if (open) {
      if (dropdownRef.current) {
        const rect = dropdownRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const expectedMenuHeight = 280; // 검색창 포함 예상치
        if (spaceBelow < expectedMenuHeight && spaceAbove > spaceBelow) {
          setDirection('up');
        } else {
          setDirection('down');
        }
      }
      // 키보드 네비 초기화 & 포커스
      setActiveIndex(-1);
      // 살짝 지연 후 포커스(오픈 애니메이션/렌더 보장)
      setTimeout(() => inputRef.current?.focus(), 0);
    } else {
      setQuery('');
      setActiveIndex(-1);
    }
  }, [open]);

  // 바깥 클릭 닫기
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node | null;
      if (dropdownRef.current && !dropdownRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 키보드 네비게이션
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = Math.min(prev + 1, filtered.length - 1);
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => {
        const next = Math.max(prev - 1, 0);
        scrollIntoView(next);
        return next;
      });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < filtered.length) {
        select(filtered[activeIndex].value);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'Tab') {
      // 탭 이동 시 닫기
      setOpen(false);
    }
  };

  const scrollIntoView = (index: number) => {
    if (!listRef.current) return;
    const item = listRef.current.querySelector<HTMLDivElement>(
      `[data-index="${index}"]`
    );
    if (!item) return;
    const parent = listRef.current;
    const parentRect = parent.getBoundingClientRect();
    const itemRect = item.getBoundingClientRect();
    if (itemRect.top < parentRect.top) {
      parent.scrollTop -= parentRect.top - itemRect.top;
    } else if (itemRect.bottom > parentRect.bottom) {
      parent.scrollTop += itemRect.bottom - parentRect.bottom;
    }
  };

  const select = (v: string) => {
    onChange?.(v);
    setOpen(false);
  };

  const clear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.('');
    setQuery('');
    setActiveIndex(-1);
    // 드롭다운은 열어둔 채로 포커스 유지
    setOpen(true);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  // 텍스트 매칭 하이라이트
  const renderHighlighted = (text: string, q: string) => {
    if (!q) return text;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return text;
    const before = text.slice(0, i);
    const match = text.slice(i, i + q.length);
    const after = text.slice(i + q.length);
    return (
      <>
        {before}
        <mark className="bg-yellow-100 rounded px-0.5">{match}</mark>
        {after}
      </>
    );
  };

  return (
    <div
      ref={dropdownRef}
      style={style}
      className={`relative ${className || ''}`}
      onKeyDown={handleKeyDown}
    >
      <div className="flex flex-col gap-2">
        <p className="text-Gray-900 body-md-medium">
          {label}{' '}
          {isMandatory && <span className="text-Red-600">*</span>}
        </p>

        {/* Trigger */}
        <div
          id={id}
          className="flex items-center h-[37px] px-2 justify-between rounded-[8px] border border-Gray-300 bg-Gray-50 cursor-pointer"
          onClick={() => setOpen((prev) => !prev)}
          role="combobox"
          aria-expanded={open}
          aria-controls={`${id}-listbox`}
          aria-haspopup="listbox"
        >
          <p id={id} className="text-Gray-700 body-md-regular truncate">
            {selectedLabel}
          </p>
          <div className="flex items-center gap-1">
            {clearable && value && (
              <button
                className="text-Gray-500 hover:text-Gray-700 body-md-regular px-1 rounded"
                onClick={clear}
                aria-label="Clear selection"
                title="Clear"
              >
                ×
              </button>
            )}
            <ChevronDown size={10} id={id} />
          </div>
        </div>
      </div>

      {/* Menu */}
      {open && (
        <div
          style={{
            width: '-webkit-fill-available',
            boxShadow:
              '0 4px 6px -1px rgba(0, 0, 0, 0.10), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
          }}
          className={`absolute left-0 z-10 ${
            direction === 'down' ? 'mt-2 top-15' : 'mb-2 bottom-9'
          }`}
        >
          <div className="rounded-[8px] bg-white w-full overflow-hidden border border-Gray-200">
            {/* 검색 입력 */}
            <div className="p-2 border-b border-Gray-200 bg-Gray-50">
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActiveIndex(-1);
                }}
                placeholder={searchPlaceholder}
                className="w-full h-9 px-3 rounded-[6px] border border-Gray-300 bg-white outline-none focus:ring-2 focus:ring-Primary-300 body-md-regular text-Gray-900"
                aria-label="Dropdown search"
              />
            </div>

            {/* 옵션 리스트 */}
            <div
              id={`${id}-listbox`}
              ref={listRef}
              role="listbox"
              aria-activedescendant={
                activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined
              }
              className="max-h-[240px] overflow-auto"
            >
              {filtered.length === 0 ? (
                <div className="px-4 py-3 text-Gray-500 body-md-regular">
                  {noResultsText}
                </div>
              ) : (
                filtered.map((option, idx) => {
                  const isActive = idx === activeIndex;
                  const isSelected = option.value === value;
                  const labelText = option.label ?? option.value;
                  return (
                    <div
                      key={option.value}
                      id={`${id}-option-${idx}`}
                      data-index={idx}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onMouseLeave={() => setActiveIndex(-1)}
                      onClick={() => select(option.value)}
                      className={`flex items-center px-4 py-2 cursor-pointer group ${
                        isActive
                          ? 'bg-Gray-100'
                          : 'hover:bg-Gray-100'
                      }`}
                    >
                      <p
                        className={`truncate ${
                          isActive
                            ? 'body-md-medium text-Gray-900'
                            : 'body-md-regular text-Gray-700'
                        }`}
                        title={labelText}
                      >
                        {renderHighlighted(labelText, query)}
                      </p>
                      {isSelected && (
                        <span className="ml-auto text-Primary-600 body-md-medium">
                          •
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

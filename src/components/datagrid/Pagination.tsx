import { ChevronLeft } from '../icons/ChevronLeft';
import { ChevronRight } from '../icons/ChevronRight';

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function Pagination(props: PaginationProps) {
    const pageGroup = Math.floor((props.currentPage - 1) / 10);
    const startPage = pageGroup * 10 + 1;
    const endPage = Math.min(startPage + 9, props.totalPages);

    const handlePrevGroup = () => {
        if (startPage > 1) {
            props.onPageChange(startPage - 1);
        }
    };

    const handleNextGroup = () => {
        if (endPage < props.totalPages) {
            props.onPageChange(endPage + 1);
        }
    };

    return (
        <div className='flex h-9 items-center rounded-[4px]'>
            <button
                disabled={startPage === 1}
                onClick={handlePrevGroup}
                className='w-9 h-full flex items-center justify-center bg-white border border-Gray-300 rounded-l-[4px] cursor-pointer hover:bg-Gray-100'
                style={{
                    pointerEvents: startPage === 1 ? 'none' : 'auto',
                }}>
                <ChevronLeft
                    fill={startPage === 1 ? '#D1D5DB' : '#6B7280'}
                    size={12}
                />
            </button>
            {Array.from({ length: endPage - startPage + 1 }, (_, i) => {
                const page = startPage + i;
                return (
                    <div
                        key={page}
                        className={`w-9 h-full flex items-center justify-center border border-l-0 border-Gray-300 cursor-pointer ${
                            props.currentPage === page
                                ? 'bg-Gray-100'
                                : 'bg-white hover:bg-Gray-100'
                        }`}
                        onClick={() => props.onPageChange(page)}>
                        <p className='text-Gray-500 body-md-medium'>{page}</p>
                    </div>
                );
            })}
            <button
                disabled={endPage === props.totalPages}
                onClick={handleNextGroup}
                className='w-9 h-full flex items-center justify-center bg-white border border-l-0 border-Gray-300 rounded-r-[4px] cursor-pointer hover:bg-Gray-100'
                style={{
                    pointerEvents: endPage === props.totalPages ? 'none' : 'auto',
                }}>
                <ChevronRight
                    fill={endPage === props.totalPages ? '#D1D5DB' : '#6B7280'}
                    size={12}
                />
            </button>
        </div>
    );
}

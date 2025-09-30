// lib/scheduleDue.ts
import { ILatestServiceSchedule } from '@/src/utils/supabase/schedule';
import { ServiceType } from '../pages/admin/companies/edit';

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}
function addYears(date: Date, years: number) {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

function getIntervalMonths(serviceType: ServiceType) {
  return serviceType === 'voc' ? 6 : 12; // voc=6개월, aqm/hepa=12개월
}

export interface RequiredItem {
  companyId: string;
  companyName: string;
  serviceType: ServiceType;
  lastConfirmedAt: Date | null;
  dueDate: Date;             // 다음 점검 기한
  alertStart: Date;          // dueDate - 30일
  daysLeft: number;          // 오늘부터 기한까지 남은 일수(음수면 연체)
  isOverdue: boolean;
}

// lastConfirmedAt가 없으면 “지금 당장 필요”로 처리: today를 기준으로 due 계산
export function buildRequiredItems(src: ILatestServiceSchedule[], now = new Date()): RequiredItem[] {
  return src.map(row => {
    const last = row.lastConfirmedAt ? new Date(row.lastConfirmedAt) : null;
    const base = last ?? now; // 첫 점검 미진행이라면 지금을 기준으로 다음 기한 산정
    const months = getIntervalMonths(row.serviceType);
    const due = months === 12 ? addYears(base, 1) : addMonths(base, 6);
    const alertStart = new Date(due.getTime() - 30 * MS_PER_DAY);
    const daysLeft = Math.ceil((due.getTime() - now.getTime()) / MS_PER_DAY);
    const isOverdue = daysLeft < 0;

    return {
      companyId: row.companyId,
      companyName: row.companyName,
      serviceType: row.serviceType,
      lastConfirmedAt: last,
      dueDate: due,
      alertStart,
      daysLeft,
      isOverdue,
    };
  });
}

// “잡아야 하는 일정”만 필터: 알림 시작일~이후(연체 포함)
export function filterRequired(items: RequiredItem[], now = new Date()) {
  return items.filter(it => now >= it.alertStart || it.isOverdue);
}


export const formatOverdueLabel = (daysOverdue: number) => {
  const months = Math.floor(daysOverdue / 30);
  const days = daysOverdue % 30;

  if (months > 0 && days > 0) return `${months}개월 ${days}일 경과`;
  if (months > 0) return `${months}개월 경과`;
  return `${days}일 경과`;
};
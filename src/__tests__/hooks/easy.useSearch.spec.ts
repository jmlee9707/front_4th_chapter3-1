import { act, renderHook } from '@testing-library/react';

import { useSearch } from '../../hooks/useSearch.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '치과',
    date: '2025-02-03',
    startTime: '10:00',
    endTime: '11:00',
    description: '치과 방문',
    location: '연세 세브란스 치과',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '2',
    title: '회의',
    date: '2025-02-25',
    startTime: '09:00',
    endTime: '18:00',
    description: '회의',
    location: '사무실',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '3',
    title: '점심',
    date: '2025-02-28',
    startTime: '19:00',
    endTime: '22:00',
    description: '친구 생일 축하',
    location: '친구 집',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '4',
    title: '운동',
    date: '2025-02-22',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
  {
    id: '5',
    title: '개인 운동',
    date: '2025-02-23',
    startTime: '18:00',
    endTime: '19:00',
    description: '주간 운동',
    location: '헬스장',
    category: '개인',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 1,
  },
];

it('검색어가 비어있을 때 모든 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-07'), 'month'));
  expect(result.current.searchTerm).toBe('');
  expect(result.current.filteredEvents).toEqual(mockEvents);
});

it('검색어에 맞는 이벤트만 필터링해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-07'), 'month'));
  const targetTerm = '주간 운동';
  act(() => {
    result.current.setSearchTerm(targetTerm);
  });

  const filteredEvent = mockEvents.filter(
    (event) =>
      event.title === targetTerm ||
      event.description === targetTerm ||
      event.location === targetTerm
  );
  expect(result.current.filteredEvents).toEqual(filteredEvent);
});

it('검색어가 제목, 설명, 위치 중 하나라도 일치하면 해당 이벤트를 반환해야 한다', () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-07'), 'month'));
  act(() => {
    result.current.setSearchTerm('치과');
  });

  expect(result.current.filteredEvents).toEqual([mockEvents[0]]);
});

it('현재 뷰(주간/월간)에 해당하는 이벤트만 반환해야 한다', () => {
  const { result: weekResult } = renderHook(() =>
    useSearch(mockEvents, new Date('2025-02-04'), 'week')
  );
  expect(weekResult.current.filteredEvents).toEqual([mockEvents[0]]);

  const { result: monthResult } = renderHook(() =>
    useSearch(mockEvents, new Date('2025-02-04'), 'month')
  );
  expect(monthResult.current.filteredEvents).toEqual(mockEvents);
});

it("검색어를 '회의'에서 '점심'으로 변경하면 필터링된 결과가 즉시 업데이트되어야 한다", () => {
  const { result } = renderHook(() => useSearch(mockEvents, new Date('2025-02-07'), 'month'));
  act(() => {
    result.current.setSearchTerm('회의');
  });
  expect(result.current.filteredEvents).toEqual([mockEvents[1]]);
  act(() => {
    result.current.setSearchTerm('점심');
  });
  expect(result.current.filteredEvents).toEqual([mockEvents[2]]);
});

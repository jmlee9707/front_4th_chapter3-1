import { act, renderHook, waitFor } from '@testing-library/react';

import { useNotifications } from '../../hooks/useNotifications.ts';
import { Event } from '../../types.ts';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2024-07-02',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

afterEach(() => {
  vi.clearAllTimers();
  vi.getRealSystemTime();
});

// 지정된 시간으로 가짜 타이머 지정 후 hook 호출
function renderNotificationsWithFakeTime(time: string) {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(time));
  return renderHook(() => useNotifications(mockEvents));
}

it('초기 상태에서는 알림이 없어야 한다', () => {
  const { result } = renderHook(() => useNotifications(mockEvents));
  expect(result.current.notifications).toEqual([]);
});

it('지정된 시간이 된 경우 알림이 새롭게 생성되어 추가된다', () => {
  const { result } = renderNotificationsWithFakeTime('2024-07-02T08:48:00');
  expect(result.current.notifications).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(120000);
  });

  expect(result.current.notifications).toHaveLength(1);
  expect(result.current.notifications).toMatchObject([
    { id: '1', message: '10분 후 회의 일정이 시작됩니다.' },
  ]);
});

it('index를 기준으로 알림을 적절하게 제거할 수 있다', async () => {
  const { result } = renderNotificationsWithFakeTime('2024-07-02T08:48:00');

  expect(result.current.notifications).toEqual([]);

  act(() => {
    vi.advanceTimersByTime(120000);
  });

  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    result.current.removeNotification(0);
  });

  await waitFor(() => {
    expect(result.current.notifications).toEqual([]);
  });
});

it('이미 알림이 발생한 이벤트에 대해서는 중복 알림이 발생하지 않아야 한다', () => {
  const { result } = renderNotificationsWithFakeTime('2024-07-02T08:48:00');

  act(() => {
    vi.advanceTimersByTime(120000);
  });
  expect(result.current.notifications).toHaveLength(1);

  act(() => {
    vi.advanceTimersByTime(1000);
  });
  expect(result.current.notifications).toHaveLength(1);
});

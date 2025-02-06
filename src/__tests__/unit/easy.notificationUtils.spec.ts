import { Event } from '../../types';
import { createNotificationMessage, getUpcomingEvents } from '../../utils/notificationUtils';

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
  {
    id: '2',
    title: '점심 회식',
    date: '2024-07-02',
    startTime: '11:00',
    endTime: '13:00',
    description: '이벤트',
    location: '',
    category: '',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 15,
  },
  {
    id: '3',
    title: '코드 리뷰',
    date: '2024-07-02',
    startTime: '11:00',
    endTime: '12:00',
    description: '프론트팀 코드 리뷰',
    location: 'room B',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 30,
  },
];
describe('getUpcomingEvents', () => {
  it('알림 시간이 정확히 도래한 이벤트를 반환한다', () => {
    expect(getUpcomingEvents(mockEvents, new Date('2024-07-02T08:50'), [])).toEqual([
      mockEvents[0],
    ]);
  });

  it('이미 알림이 간 이벤트는 제외한다', () => {
    expect(getUpcomingEvents(mockEvents, new Date('2024-07-02T08:50'), ['1'])).toEqual([]);
  });

  it('알림 시간이 아직 도래하지 않은 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(mockEvents, new Date('2024-07-02T10:24'), [])).toEqual([]);
    expect(getUpcomingEvents(mockEvents, new Date('2024-07-02T10:44'), [])).toEqual([
      mockEvents[2],
    ]);
  });

  it('알림 시간이 지난 이벤트는 반환하지 않는다', () => {
    expect(getUpcomingEvents(mockEvents, new Date('2024-07-02T11:01'), [])).toEqual([]);
  });
});

describe('createNotificationMessage', () => {
  it('올바른 알림 메시지를 생성해야 한다', () => {
    expect(createNotificationMessage(mockEvents[0])).toBe('10분 후 회의 일정이 시작됩니다.');
    expect(createNotificationMessage(mockEvents[1])).toBe('15분 후 점심 회식 일정이 시작됩니다.');
    expect(createNotificationMessage(mockEvents[2])).toBe('30분 후 코드 리뷰 일정이 시작됩니다.');
  });
});

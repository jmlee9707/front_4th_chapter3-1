import { Event } from '../../types';
import {
  convertEventToDateRange,
  findOverlappingEvents,
  isOverlapping,
  parseDateTime,
} from '../../utils/eventOverlap';

const mockEvents: Event[] = [
  {
    id: '1',
    title: '회의',
    date: '2025-02-01',
    startTime: '09:00',
    endTime: '10:00',
    description: '팀 미팅',
    location: '회의실 다낭',
    category: '업무',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '2',
    title: '주간 보고',
    date: '2025-02-02',
    startTime: '10:00',
    endTime: '14:00',
    description: '팀 주간 보고',
    location: '회의실 몰디브',
    category: '보고',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
  {
    id: '3',
    title: '코드 리뷰',
    date: '2025-02-02',
    startTime: '11:00',
    endTime: '12:00',
    description: '프론트팀 코드 리뷰',
    location: '회의실 세부',
    category: '회의',
    repeat: { type: 'none', interval: 0 },
    notificationTime: 10,
  },
];

const mockNewEvent: Event = {
  id: '10',
  title: '다과시간',
  date: '2025-02-02',
  startTime: '11:20',
  endTime: '11:50',
  description: '휴식',
  location: '탕비실',
  category: '휴식',
  repeat: { type: 'none', interval: 0 },
  notificationTime: 10,
};

describe('parseDateTime', () => {
  it('2024-07-01 14:30을 정확한 Date 객체로 변환한다', () => {
    const julyFirst = parseDateTime('2024-07-01', '14:30');
    expect(julyFirst.getFullYear()).toBe(2024);
    expect(julyFirst.getMonth() + 1).toBe(7);
    expect(julyFirst.getHours()).toBe(14);
    expect(julyFirst.getMinutes()).toBe(30);
  });

  it('잘못된 날짜 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidDate = parseDateTime('invalid-date', '14:30');
    expect(isNaN(invalidDate.getTime())).toBe(true);
  });

  it('잘못된 시간 형식에 대해 Invalid Date를 반환한다', () => {
    const invalidTime = parseDateTime('2024-07-01', 'invalid-time');
    expect(isNaN(invalidTime.getTime())).toBe(true);
  });

  it('날짜 문자열이 비어있을 때 Invalid Date를 반환한다', () => {
    const emptyDate = parseDateTime('', '14:30');
    expect(isNaN(emptyDate.getTime())).toBe(true);
  });
});

describe('convertEventToDateRange', () => {
  it('일반적인 이벤트를 올바른 시작 및 종료 시간을 가진 객체로 변환한다', () => {
    expect(convertEventToDateRange(mockEvents[0])).toHaveProperty('start');
    expect(convertEventToDateRange(mockEvents[0])).toHaveProperty('end');
    expect(convertEventToDateRange(mockEvents[0])).toEqual({
      start: new Date('2025-02-01T09:00'),
      end: new Date('2025-02-01T10:00'),
    });
  });

  it('잘못된 날짜 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({ ...mockEvents[1], date: 'invalid-date' });

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });

  it('잘못된 시간 형식의 이벤트에 대해 Invalid Date를 반환한다', () => {
    const result = convertEventToDateRange({
      ...mockEvents[1],
      startTime: 'invalid-start-time',
      endTime: 'invalid-end-time',
    });

    expect(isNaN(result.start.getTime())).toBe(true);
    expect(isNaN(result.end.getTime())).toBe(true);
  });
});

describe('isOverlapping', () => {
  it('두 이벤트가 겹치는 경우 true를 반환한다', () => {
    expect(isOverlapping(mockEvents[1], mockEvents[2])).toBe(true);
  });

  it('두 이벤트가 겹치지 않는 경우 false를 반환한다', () => {
    expect(isOverlapping(mockEvents[0], mockEvents[2])).toBe(false);
  });
});

describe('findOverlappingEvents', () => {
  it('새 이벤트와 겹치는 모든 이벤트를 반환한다', () => {
    expect(findOverlappingEvents(mockNewEvent, mockEvents)).toEqual(mockEvents.slice(1));
  });

  it('겹치는 이벤트가 없으면 빈 배열을 반환한다', () => {
    expect(findOverlappingEvents({ ...mockNewEvent, date: '2026-01-01' }, mockEvents)).toEqual([]);
  });
});

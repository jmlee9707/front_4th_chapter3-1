import { Event } from '../../types';
import { getFilteredEvents } from '../../utils/eventUtils';

describe('getFilteredEvents', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '회의',
      date: '2024-06-30',
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
      title: '이벤트 2',
      date: '2024-07-02',
      startTime: '10:00',
      endTime: '14:00',
      description: '이벤트',
      location: 'room A',
      category: '보고',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '3',
      title: '코드 리뷰',
      date: '2024-07-04',
      startTime: '11:00',
      endTime: '12:00',
      description: '프론트팀 코드 리뷰',
      location: 'room B',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '4',
      title: '이벤트 4',
      date: '2024-07-08',
      startTime: '13:00',
      endTime: '15:00',
      description: '백엔드팀 코드 리뷰',
      location: 'ROOM a',
      category: '회의',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it("검색어 '이벤트 2'에 맞는 이벤트만 반환한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트 2', new Date('2024-07-01'), 'month');
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual(mockEvents[1]);
  });

  it('주간 뷰에서 2024-07-01 주의 이벤트만 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-01'), 'week');
    expect(result).toHaveLength(3);
    expect(result).toEqual(mockEvents.slice(0, 3));
  });

  it('월간 뷰에서 2024년 7월의 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07'), 'month');
    expect(result).toHaveLength(3);
    expect(result).toEqual(mockEvents.slice(1));
  });

  it("검색어 '이벤트'와 주간 뷰 필터링을 동시에 적용한다", () => {
    const result = getFilteredEvents(mockEvents, '이벤트', new Date('2024-07-03'), 'week');
    expect(result).toHaveLength(1);
    expect(result).toEqual([mockEvents[1]]);
  });

  it('검색어가 없을 때 모든 이벤트를 반환한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07-03'), 'month');
    expect(result).toHaveLength(3);
    expect(result).toEqual(mockEvents.slice(1));
  });

  it('검색어가 대소문자를 구분하지 않고 작동한다', () => {
    const result = getFilteredEvents(mockEvents, 'ROOM b', new Date('2024-07-03'), 'week');
    expect(result).toHaveLength(1);
    expect(result).toEqual([mockEvents[2]]);
  });

  it('월의 경계에 있는 이벤트를 올바르게 필터링한다', () => {
    const result = getFilteredEvents(mockEvents, '', new Date('2024-07'), 'month');
    expect(result).toEqual(mockEvents.splice(1));
  });

  it('빈 이벤트 리스트에 대해 빈 배열을 반환한다', () => {
    const result = getFilteredEvents(mockEvents, 'ROOM C', new Date('2024-07-03'), 'month');
    expect(result).toEqual([]);
  });
});

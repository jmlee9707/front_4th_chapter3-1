import { ChakraProvider } from '@chakra-ui/react';
import { render, screen, within, waitFor } from '@testing-library/react';
import { UserEvent, userEvent } from '@testing-library/user-event';
import { ReactElement } from 'react';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../__mocks__/handlersUtils';
import App from '../App';
import { Event } from '../types';

// ! HINT. 이 유틸을 사용해 리액트 컴포넌트를 렌더링해보세요.
const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  // ? Medium: 여기서 ChakraProvider로 묶어주는 동작은 의미있을까요? 있다면 어떤 의미일까요?
  return { ...render(<ChakraProvider>{element}</ChakraProvider>), user };
};

// ! HINT. 이 유틸을 사용해 일정을 저장해보세요.
const saveSchedule = async (
  user: UserEvent,
  form: Omit<Event, 'id' | 'notificationTime' | 'repeat'>,
  isEditing: boolean
) => {
  const { title, date, startTime, endTime, location, description, category } = form;

  if (!isEditing) await user.click(screen.getAllByText('일정 추가')[0]);

  await user.type(screen.getByLabelText('제목'), title);
  await user.type(screen.getByLabelText('날짜'), date);
  await user.type(screen.getByLabelText('시작 시간'), startTime);
  await user.type(screen.getByLabelText('종료 시간'), endTime);
  await user.type(screen.getByLabelText('설명'), description);
  await user.type(screen.getByLabelText('위치'), location);
  await user.selectOptions(screen.getByLabelText('카테고리'), category);

  await user.click(screen.getByTestId('event-submit-button'));
};

// ! HINT. "검색 결과가 없습니다"는 초기에 노출되는데요. 그럼 검증하고자 하는 액션이 실행되기 전에 검증해버리지 않을까요? 이 테스트를 신뢰성있게 만드려면 어떻게 할까요?
describe('일정 CRUD 및 기본 기능', () => {
  beforeEach(() => {
    vi.setSystemTime(new Date('2024-10-15'));
  });
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });
  const mockEvent: Event[] = [
    {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('입력한 새로운 일정 정보에 맞춰 모든 필드가 이벤트 리스트에 정확히 저장된다.', async () => {
    // ! HINT. event를 추가 제거하고 저장하는 로직을 잘 살펴보고, 만약 그대로 구현한다면 어떤 문제가 있을 지 고민해보세요.
    setupMockHandlerCreation([]);
    const { user } = setup(<App />);
    await saveSchedule(user, mockEvent[0], false);

    await waitFor(() => {
      expect(
        within(screen.getByTestId('event-list')).getByText(mockEvent[0].title)
      ).toBeInTheDocument();
    });
  });

  it('기존 일정의 세부 정보를 수정하고 변경사항이 정확히 반영된다', async () => {
    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await waitFor(async () => {
      expect(
        within(await screen.getByTestId('event-list')).getByText('기존 회의')
      ).toBeInTheDocument();
    });
    const updateButton = await screen.findAllByLabelText('Edit event');
    await user.click(updateButton[0]);

    await user.clear(screen.getByLabelText('설명'));
    await user.type(screen.getByLabelText('설명'), '변경');
    await user.click(screen.getByTestId('event-submit-button'));
    await waitFor(() => {
      expect(within(screen.getByTestId('event-list')).getByText('변경')).toBeInTheDocument();
    });
  });

  it('일정을 삭제하고 더 이상 조회되지 않는지 확인한다', async () => {
    setupMockHandlerDeletion();
    const { user } = setup(<App />);

    const deleteButton = await screen.findByLabelText('Delete event');
    await user.click(deleteButton);
    await waitFor(() => {
      expect(
        within(screen.getByTestId('event-list')).queryByText('삭제할 이벤트')
      ).not.toBeInTheDocument();
    });
  });
});

describe('일정 뷰', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('주별 뷰를 선택 후 해당 주에 일정이 없으면, 일정이 표시되지 않는다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);
    user.selectOptions(screen.getByTestId('view-select-box'), 'week');

    await waitFor(() => {
      expect(screen.queryByTestId('event-box')).toBeNull();
      expect(
        within(screen.getByTestId('event-list')).getByText('검색 결과가 없습니다.')
      ).toBeInTheDocument();
    });
  });

  it('주별 뷰 선택 후 해당 일자에 일정이 존재한다면 해당 일정이 정확히 표시된다', async () => {
    const newEvent = {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    vi.setSystemTime(new Date('2024-10-15'));
    setupMockHandlerCreation([newEvent] as Event[]);

    const { user } = setup(<App />);
    user.selectOptions(screen.getByTestId('view-select-box'), 'week');

    await waitFor(() => {
      expect(
        within(screen.getByTestId('event-list')).queryByText('검색 결과가 없습니다.')
      ).toBeNull();
      expect(within(screen.getByTestId('event-list')).getByText('2024-10-15')).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 없으면, 일정이 표시되지 않아야 한다.', async () => {
    setupMockHandlerCreation([]);

    const { user } = setup(<App />);
    user.selectOptions(screen.getByTestId('view-select-box'), 'month');

    await waitFor(() => {
      expect(screen.queryByTestId('event-box')).toBeNull();
      expect(
        within(screen.getByTestId('event-list')).getByText('검색 결과가 없습니다.')
      ).toBeInTheDocument();
    });
  });

  it('월별 뷰에 일정이 정확히 표시되는지 확인한다', async () => {
    const newEvent = {
      id: '1',
      title: '기존 회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    vi.setSystemTime(new Date('2024-10-15'));
    setupMockHandlerCreation([newEvent] as Event[]);
    const { user } = setup(<App />);
    user.selectOptions(screen.getByTestId('view-select-box'), 'month');

    await waitFor(() => {
      expect(
        within(screen.getByTestId('event-list')).queryByText('검색 결과가 없습니다.')
      ).toBeNull();
      expect(within(screen.getByTestId('event-list')).getByText('2024-10-15')).toBeInTheDocument();
    });
  });

  it('달력에 1월 1일(신정)이 공휴일로 표시되는지 확인한다', async () => {
    vi.setSystemTime(new Date('2024-01-01'));
    setup(<App />);

    await waitFor(() => {
      expect(within(screen.getByTestId('month-view')).queryByText('신정')).toBeInTheDocument();
    });
  });
});

describe('검색 기능', () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-07-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
    {
      id: '2',
      title: '주간 회의',
      date: '2024-07-02',
      startTime: '13:00',
      endTime: '14:00',
      description: '팀 미팅',
      location: '회의실 2',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];
  it('검색 결과가 없으면, "검색 결과가 없습니다."가 표시되어야 한다.', async () => {
    setupMockHandlerCreation(mockEvents);
    const { user } = setup(<App />);

    const searchBar = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchBar, '점심 약속');

    await waitFor(() => {
      expect(
        within(screen.getByTestId('event-list')).getByText('검색 결과가 없습니다.')
      ).toBeInTheDocument();
    });
  });

  it("'팀 회의'를 검색하면 해당 제목을 가진 일정이 리스트에 노출된다", async () => {
    setupMockHandlerCreation(mockEvents);
    vi.setSystemTime(new Date('2024-07-01'));
    const { user } = setup(<App />);

    const searchBar = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchBar, '팀 회의');

    await waitFor(() => {
      const eventTitles = within(screen.getByTestId('event-list')).queryAllByTestId('event-title');
      expect(eventTitles).toHaveLength(1);
      expect(eventTitles[0]).toHaveTextContent('팀 회의');
    });
  });

  it('검색어를 지우면 모든 일정이 다시 표시되어야 한다', async () => {
    setupMockHandlerCreation(mockEvents);
    vi.setSystemTime(new Date('2024-07-01'));
    const { user } = setup(<App />);

    const searchBar = screen.getByPlaceholderText('검색어를 입력하세요');
    await user.type(searchBar, '팀 회의');

    await waitFor(() => {
      const eventTitles = within(screen.getByTestId('event-list')).queryAllByTestId('event-title');
      expect(eventTitles).toHaveLength(1);
      expect(eventTitles[0]).toHaveTextContent('팀 회의');
    });

    await user.clear(searchBar);
    await waitFor(() => {
      const eventTitles = within(screen.getByTestId('event-list')).queryAllByTestId('event-title');
      expect(eventTitles).toHaveLength(2);
    });
  });
});

describe('일정 충돌', () => {
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-07-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  it('겹치는 시간에 새 일정을 추가할 때 경고가 표시된다', async () => {
    const newEvent = {
      id: '2',
      title: '주간 회의',
      date: '2024-07-02',
      startTime: '09:20',
      endTime: '09:50',
      description: '팀 미팅',
      location: '회의실 2',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    setupMockHandlerCreation(mockEvents);

    const { user } = setup(<App />);

    await saveSchedule(user, newEvent, false);
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });

  it('기존 일정의 시간을 수정하여 충돌이 발생하면 경고가 노출된다', async () => {
    const updateEvent: Event = {
      id: '1',
      title: '팀 회의',
      date: '2024-10-15',
      startTime: '11:20',
      endTime: '12:40',
      description: '팀 미팅',
      location: '회의실 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };
    vi.setSystemTime(new Date('2024-10-15'));

    setupMockHandlerUpdating();
    const { user } = setup(<App />);

    await saveSchedule(user, updateEvent, false);
    await waitFor(() => {
      expect(screen.getByText('일정 겹침 경고')).toBeInTheDocument();
    });
  });
});

it('notificationTime을 10으로 하면 지정 시간 10분 전 알람 텍스트가 노출된다', async () => {
  const mockEvents: Event[] = [
    {
      id: '1',
      title: '팀 회의',
      date: '2024-07-02',
      startTime: '09:00',
      endTime: '10:00',
      description: '팀 미팅',
      location: '회의실 1',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    },
  ];

  setupMockHandlerCreation(mockEvents);
  vi.setSystemTime(new Date('2024-07-02T08:50'));
  setup(<App />);
  await waitFor(() => {
    expect(screen.getByText('10분 후 팀 회의 일정이 시작됩니다.')).toBeInTheDocument();
  });
});

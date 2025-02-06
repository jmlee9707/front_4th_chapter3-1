import { act, renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';

import {
  setupMockHandlerCreation,
  setupMockHandlerDeletion,
  setupMockHandlerUpdating,
} from '../../__mocks__/handlersUtils.ts';
import { useEventOperations } from '../../hooks/useEventOperations.ts';
import { server } from '../../setupTests.ts';
import { Event } from '../../types.ts';

// ? Medium: 아래 toastFn과 mock과 이 fn은 무엇을 해줄까요?
// A : toastFn을 mock 처리
const toastFn = vi.fn(); // 모의 함수 생성

vi.mock('@chakra-ui/react', async () => {
  const actual = await vi.importActual('@chakra-ui/react');
  return {
    ...actual,
    useToast: () => toastFn,
  };
});

it('저장되어있는 초기 이벤트 데이터를 적절하게 불러온다 : "일정 로딩 완료" 토스트가 노출 된다.', async () => {
  setupMockHandlerCreation([]);

  const { result } = renderHook(() => useEventOperations(false));

  await waitFor(() => {
    expect(result.current.events).toEqual([]);
  });

  expect(toastFn).toHaveBeenCalledWith(
    expect.objectContaining({
      title: '일정 로딩 완료!',
    })
  );
});

describe('이벤트 추가, 수정, 삭제', () => {
  it('정의된 이벤트 정보를 기준으로 적절하게 저장이 된다', async () => {
    setupMockHandlerCreation([]);
    const onSave = vi.fn();

    const { result } = renderHook(() => useEventOperations(false, onSave));
    await waitFor(() => {
      expect(result.current.events).toEqual([]);
    });

    const newEvent = {
      id: '1',
      title: '회의',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '10:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(newEvent as Event);
    });

    expect(onSave).toHaveBeenCalled();
    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 추가되었습니다.',
      })
    );

    await waitFor(() => {
      expect(result.current.events).toEqual([newEvent]);
    });
  });

  it("새로 정의된 'title', 'endTime' 기준으로 적절하게 일정이 업데이트 된다", async () => {
    setupMockHandlerUpdating();
    const { result } = renderHook(() => useEventOperations(true));
    await waitFor(() => {
      // init data 2개
      expect(result.current.events).toHaveLength(2);
    });

    const updateEvent = {
      id: '1',
      title: '기존 회의3',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '12:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updateEvent as Event);
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정이 수정되었습니다.',
      })
    );
    await waitFor(() => {
      expect(result.current.events[0].title).toBe('기존 회의3');
    });
  });

  it('존재하는 이벤트 삭제 시 에러없이 아이템이 삭제된다.', async () => {
    setupMockHandlerDeletion();
    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      // init data 1개
      expect(result.current.events).toHaveLength(1);
    });

    const eventId = result.current.events[0].id;

    await act(async () => {
      await result.current.deleteEvent(eventId);
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(0);
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '일정이 삭제되었습니다.',
        })
      );
    });
  });
});

describe('에러 처리', () => {
  it("이벤트 로딩 실패 시 '이벤트 로딩 실패'라는 텍스트와 함께 에러 토스트가 표시되어야 한다", async () => {
    server.use(
      http.get('/api/events', () => {
        return HttpResponse.error();
      })
    );

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(toastFn).toHaveBeenCalledWith(
        expect.objectContaining({
          title: '이벤트 로딩 실패',
        })
      );
      expect(result.current.events).toEqual([]);
    });
  });

  it("존재하지 않는 이벤트 수정 시 '일정 저장 실패'라는 토스트가 노출되며 에러 처리가 되어야 한다", async () => {
    setupMockHandlerCreation([]);

    const { result } = renderHook(() => useEventOperations(true));
    await waitFor(() => {
      expect(result.current.events).toHaveLength(0);
    });

    const updateEvent = {
      id: '999999',
      title: '기존 회의09999',
      date: '2024-10-15',
      startTime: '09:00',
      endTime: '12:00',
      description: '기존 팀 미팅',
      location: '회의실 B',
      category: '업무',
      repeat: { type: 'none', interval: 0 },
      notificationTime: 10,
    };

    await act(async () => {
      await result.current.saveEvent(updateEvent as Event);
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 저장 실패',
      })
    );
  });

  it("네트워크 오류 시 '일정 삭제 실패'라는 텍스트가 노출되며 이벤트 삭제가 실패해야 한다", async () => {
    server.use(
      http.delete('/api/events/:id', () => {
        return HttpResponse.error();
      })
    );
    setupMockHandlerUpdating();

    const { result } = renderHook(() => useEventOperations(false));

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    const eventId = result.current.events[0].id;

    await act(async () => {
      await result.current.deleteEvent(eventId);
    });

    await waitFor(() => {
      expect(result.current.events).toHaveLength(2);
    });

    expect(toastFn).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '일정 삭제 실패',
      })
    );
  });
});

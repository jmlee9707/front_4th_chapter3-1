import { getTimeErrorMessage } from '../../utils/timeValidation';

describe('getTimeErrorMessage >', () => {
  const errorMessage = {
    startTimeError: '시작 시간은 종료 시간보다 빨라야 합니다.',
    endTimeError: '종료 시간은 시작 시간보다 늦어야 합니다.',
  };
  const noneErrorMessage = { startTimeError: null, endTimeError: null };

  it('시작 시간이 종료 시간보다 늦을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('16:00', '15:00')).toEqual(errorMessage);
  });

  it('시작 시간과 종료 시간이 같을 때 에러 메시지를 반환한다', () => {
    expect(getTimeErrorMessage('16:00', '16:00')).toEqual(errorMessage);
  });

  it('시작 시간이 종료 시간보다 빠를 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('12:00', '15:00').startTimeError).toBeNull();
    expect(getTimeErrorMessage('12:00', '15:00').endTimeError).toBeNull();
  });

  it('시작 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '15:00')).toEqual(noneErrorMessage);
  });

  it('종료 시간이 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('17:00', '')).toEqual(noneErrorMessage);
  });

  it('시작 시간과 종료 시간이 모두 비어있을 때 null을 반환한다', () => {
    expect(getTimeErrorMessage('', '')).toEqual(noneErrorMessage);
  });
});

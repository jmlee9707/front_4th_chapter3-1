import { fetchHolidays } from '../../apis/fetchHolidays';

describe('fetchHolidays', () => {
  const septemberHolidays = { '2024-09-16': '추석', '2024-09-17': '추석', '2024-09-18': '추석' };
  const octoberHolidays = { '2024-10-03': '개천절', '2024-10-09': '한글날' };
  it('주어진 월의 공휴일만 반환한다', () => {
    expect(fetchHolidays(new Date('2024-10'))).toEqual(octoberHolidays);
  });

  it('공휴일이 없는 월에 대해 빈 객체를 반환한다', () => {
    expect(fetchHolidays(new Date('2024-07'))).toEqual({});
  });

  it('여러 공휴일이 있는 월에 대해 모든 공휴일을 반환한다', () => {
    expect(fetchHolidays(new Date('2024-09'))).toEqual(septemberHolidays);
  });
});

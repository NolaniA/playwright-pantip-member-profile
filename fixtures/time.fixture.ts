import { test as base } from '@playwright/test';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

type ThaiTimeFixture = {
  currentTime: Dayjs;
  futureTime: Dayjs;
  pastTime: Dayjs;
  randomPastTime: Dayjs;

  nextDay: Dayjs;
  nextWeek: Dayjs;
  nextMonth: Dayjs;
  nextYear: Dayjs;
  
  previousDay: Dayjs;
  previousWeek: Dayjs;
  previousMonth: Dayjs;
  previousYear: Dayjs;
  
};

const thaiNow = () => dayjs().tz('Asia/Bangkok');

export const test = base.extend<ThaiTimeFixture>({
  currentTime: async ({}, use) => {
    await use(thaiNow());
  },

  futureTime: async ({}, use) => {
    await use(thaiNow().add(7, 'day'));
  },

  pastTime: async ({}, use) => {
    await use(thaiNow().subtract(7, 'day'));
  },

  randomPastTime: async ({}, use) => {
    const startDate = dayjs('1996-01-01');
    const endDate = thaiNow();

    const diffDays = endDate.diff(startDate, 'day');

    const randomDays = Math.floor(
        Math.random() * diffDays
    );

    const randomDate = startDate.add(randomDays, 'day');

    await use(randomDate);
  },

  nextDay: async ({}, use) => {
    await use(thaiNow().add(1, 'day'));
  },

  nextWeek: async ({}, use) => {
    await use(thaiNow().add(1, 'week'));
  },

  nextMonth: async ({}, use) => {
    await use(thaiNow().add(1, 'month'));
  },

  nextYear: async ({}, use) => {
    await use(thaiNow().add(1, 'year'));
  },
  previousDay: async ({}, use) => {
    await use(thaiNow().subtract(1, 'day'));
  },

  previousWeek: async ({}, use) => {
    await use(thaiNow().subtract(1, 'week'));
  },

  previousMonth: async ({}, use) => {
    await use(thaiNow().subtract(1, 'month'));
  },

  previousYear: async ({}, use) => {
    await use(thaiNow().subtract(1, 'year'));
  },


});

export { expect } from '@playwright/test';
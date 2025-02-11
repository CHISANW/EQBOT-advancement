import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import isBetween from 'dayjs/plugin/isBetween';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isBetween);
dayjs.tz.setDefault('Asia/Seoul');

export const getNow = (now = undefined) => {
    if (now) {
        return dayjs(now).utc().tz().toISOString();
    }
    return dayjs().utc().tz().toISOString();
};

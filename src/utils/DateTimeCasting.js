import Moment from 'moment';

export function SecondToMinuteString(seconds) {
    let minute = 0, second = 0;
    if(seconds > 59) {
        minute = parseInt(seconds / 60);
        second = parseInt(seconds % 60);
    } else {
        second = parseInt(seconds);
    }

    return (minute > 9 ? minute : "0" + minute) + ":" + (second > 9 ? second : "0" + second);
}

export function SecondToMinuteStringWithUnit(seconds, isAbbreviation) {
    let minute = 0, second = 0;
    if (seconds > 59) {
        minute = parseInt(seconds / 60);
        second = parseInt(seconds % 60);
    } else {
        second = parseInt(seconds);
        return second + (isAbbreviation ? " sec " : " seconds ");
    }

    return minute + (isAbbreviation ? " min " : " minutes ")
        + second + (isAbbreviation ? " sec " : " seconds ");
}

export function SecondToHourString(seconds) {
    let hour = 0, minute = 0, second = 0;
    if (seconds > 59) {
        minute = parseInt(seconds / 60);
        second = parseInt(seconds % 60);

        if (minute > 59) {
            hour = parseInt(minute / 60);
            minute = parseInt(minute % 60);
        }
    } else {
        second = parseInt(seconds);
    }

    return (hour > 9 ? hour : "0" + hour) 
        + ":" + (minute > 9 ? minute : "0" + minute) 
        + ":" + (second > 9 ? second : "0" + second);
}

export function ShowDateTime(dateTimeObj) {
    let dateVal = Moment(dateTimeObj);
    let currDate = Moment(new Date());
    let startDateVal = Moment(currDate).format('YYYY-MM-DD');
    let endDateVal = Moment(dateVal).format('YYYY-MM-DD');

    let diff = Moment(startDateVal).diff(endDateVal, 'days');
    if (diff == 0) {
        return Moment(dateVal).format('hh:mm a');
    } else if (diff == 1) {
        return 'Yesterday';
    } else {
        return Moment(dateVal).format('DD MMM, YYYY');
    }
}
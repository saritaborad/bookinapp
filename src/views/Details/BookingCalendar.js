import findIndex from "lodash/findIndex";
import some from "lodash/some";
import moment from "moment";
import React, { Component } from "react";
import { DateRangePicker } from "react-dates";
import { withTranslation } from "react-i18next";
import "./BookingDetails.scss";

class BookingCalendar extends Component {
  START_DATE_INPUT_NAME = "startDate";
  END_DATE_INPUT_NAME = "endDate";

  constructor(props) {
    super(props);

    this.state = {
      blockedDays: this.props.blockedDays,
      bookedDays: this.props.bookedDays,
      startDate: this.props.startDate,
      endDate: this.props.endDate,
      minNights: this.props.minNights,
      maxNights: this.props.maxNights,
    };
  }

  UNSAFE_componentWillReceiveProps(props) {
    this.setState({
      minNights: props.minNights,
      maxNights: props.maxNights,
      blockedDays: props.blockedDays,
      bookedDays: props.bookedDays,
    });
  }

  onDateRangeSelected = ({ startDate, endDate }) => {
    this.setState({
      focusedInput: null,
      startDate,
      endDate,
    });
  };

  hasBlockedDaysInRange = ({ startDate, endDate, bookedDays, blockedDays }) => {
    return (
      startDate &&
      endDate &&
      bookedDays
        .slice(
          this.getDateIndex(startDate, bookedDays) + 1,
          this.getDateIndex(endDate, bookedDays)
        )
        .some((_day) => this.isDayBlocked(_day.date, blockedDays, bookedDays))
    );
  };

  getDateIndex(date, bookedDays) {
    return date
      ? findIndex(
          bookedDays,
          (_day) => _day.date === this.getFormattedDate(date)
        )
      : -1;
  }

  reopenPicker = () => {
    this.setState({ focusedInput: null }, this.onFocusChange);
  };

  // DL-33: first and last day of manual blocks should be clickable
  dayContentRenderer = (day) => (
    <div
      className={
        `d-flex align-items-center justify-content-center` +
        (this.isDayBlocked(
          this.getFormattedDate(day),
          this.state.blockedDays,
          this.state.bookedDays
        )
          ? " custom-calendar-day"
          : "")
      }
    >
      {day.format("D")}
    </div>
  );

  isDayBlocked = (day, blockedDays, bookedDays) => {
    const date = (blockedDays ? blockedDays : {})[day];
    const dateIndex = findIndex(bookedDays, (_day) => _day.date === day);

    if (!date) {
      return false;
    } else if (
      date &&
      (!this.state.focusedInput || (!date.isCheckIn && !date.isCheckOut))
    ) {
      if (date.blockRefs?.[0]?.startDate.startsWith(day)) {
        return false;
      }
      return true;
      // day is checkout and could not be treated as checkin
    } else if (
      this.state.focusedInput === this.START_DATE_INPUT_NAME &&
      date.isCheckOut
    ) {
      const nextBlockedDate =
        blockedDays[(bookedDays[dateIndex + 1] || {}).date];
      return (
        !!date.isCheckIn ||
        (nextBlockedDate &&
          !nextBlockedDate.isCheckIn &&
          !nextBlockedDate.isCheckOut)
      );
      // day is checkin and could not be treated as checkout
    } else if (
      this.state.focusedInput === this.END_DATE_INPUT_NAME &&
      date.isCheckIn
    ) {
      const prevBlockedDate =
        blockedDays[(bookedDays[dateIndex - 1] || {}).date];
      return (
        !!date.isCheckOut ||
        (prevBlockedDate &&
          !prevBlockedDate.isCheckIn &&
          !prevBlockedDate.isCheckOut)
      );
    } else if (
      this.state.focusedInput === this.END_DATE_INPUT_NAME &&
      date.isCheckOut
    ) {
      return false;
    }
    return true;
  };

  isEndDateForSelectedStartDate = ({
    dateIndex,
    startDateIndex,
    bookedDays,
    minNights,
    firstBlockedDateIndex,
  }) => {
    if (~startDateIndex) {
      // check first if date is not after any blocked one
      return (
        (~firstBlockedDateIndex ? dateIndex < firstBlockedDateIndex : true) &&
        dateIndex - startDateIndex >=
          (bookedDays[startDateIndex].minNights
            ? bookedDays[startDateIndex].minNights
            : minNights)
      );
    }
    return true;
  };

  isStartDateForSelectedEndDate = ({
    dateIndex,
    endDateIndex,
    bookedDays,
    minNights,
  }) =>
    ~endDateIndex
      ? endDateIndex - dateIndex >=
        (bookedDays[dateIndex].minNights
          ? bookedDays[dateIndex].minNights
          : minNights)
      : true;

  meetsMinNightsRange = ({
    blockedDays,
    bookedDays,
    focusedInput,
    dateIndex,
    minNights,
    startDateIndex,
  }) => {
    const isStartDateInput = focusedInput === this.START_DATE_INPUT_NAME;
    const multiplier = isStartDateInput ? 1 : -1;
    let counter = dateIndex + multiplier;

    const limitCondition = isStartDateInput
      ? Math.abs(dateIndex - counter) <= minNights
      : true;

    let closestBlocked = null;
    while (bookedDays[counter] && closestBlocked === null && limitCondition) {
      const day = bookedDays[counter];

      if (!day) {
        // break if there is no data
        closestBlocked = counter;
      } else if (
        blockedDays[day.date] &&
        ((isStartDateInput
          ? !blockedDays[day.date].isCheckIn
          : !blockedDays[day.date].isCheckOut) ||
          (blockedDays[day.date].isCheckIn && blockedDays[day.date].isCheckOut))
      ) {
        // if it is reservation but not checkin or checkout date
        closestBlocked = counter;
      } else if (
        blockedDays[day.date] &&
        !blockedDays[day.date].reservation &&
        !blockedDays[day.date].isCheckOut
      ) {
        // if day is not available (but is not reservation)
        closestBlocked = counter;
      }

      /**
       * break if:
       * - endInput is focused and closest blocked date is present
       */
      if (!isStartDateInput && closestBlocked !== null && !~startDateIndex) {
        const _bookedDays = bookedDays.slice(closestBlocked + 1, dateIndex);
        const bookedDaysLength = _bookedDays.length;
        // check if we have at least one date with matching minNights for currenct end date
        const hasStartDatesWithMatchingMinNights = some(
          _bookedDays,
          this.getMatchingMingNightsDateFunctor({
            endDateIndex: bookedDaysLength,
            bookedDays: _bookedDays,
            minNights,
          })
        );
        if (!hasStartDatesWithMatchingMinNights) {
          return false;
        } else {
          return true;
        }
      }

      counter += multiplier;
    }

    return (
      !closestBlocked ||
      Math.abs(dateIndex - closestBlocked) >
        ((!isStartDateInput && bookedDays[closestBlocked + 1].minNights) ||
          minNights)
    );
  };

  getMatchingMingNightsDateFunctor =
    ({ endDateIndex, bookedDays, minNights }) =>
    (_, index) =>
      this.isStartDateForSelectedEndDate({
        dateIndex: index,
        endDateIndex,
        bookedDays,
        minNights,
      });

  getFormattedDate = (day) => day.format("YYYY-MM-DD");

  isBeforeToday = (day) =>
    day.diff(moment(new Date()).format("YYYY-MM-DD")) < 0;

  /* Is in the past, booked, doesn't meet min/max night rules */
  isOutsideRange = (day) => {
    const {
      focusedInput,
      startDate,
      endDate,
      blockedDays,
      bookedDays,
      minNights,
      maxNights,
    } = this.state;

    /* Do not any calculations if there is booked days or picker is closed */
    if (!bookedDays || !bookedDays.length || !focusedInput) {
      return false;
    }

    /* Day is blocked if it is in past */
    if (this.isBeforeToday(day)) {
      return true;
    }

    const date = this.getFormattedDate(day);
    const isBlocked = this.isDayBlocked(date, blockedDays, bookedDays);

    /* Day is blocked if it is booked */
    if (isBlocked) {
      return true;
    }

    if (focusedInput === this.START_DATE_INPUT_NAME) {
      const dateIndex = findIndex(bookedDays, (_day) => _day.date === date);
      const endDateIndex = endDate
        ? findIndex(
            bookedDays,
            (_day) => _day.date === this.getFormattedDate(endDate)
          )
        : -1;

      const meetsMinNights =
        ~dateIndex &&
        this.meetsMinNightsRange({
          blockedDays,
          bookedDays,
          focusedInput: this.START_DATE_INPUT_NAME,
          dateIndex,
          minNights: bookedDays[dateIndex].minNights || minNights,
        }) &&
        this.isStartDateForSelectedEndDate({
          dateIndex,
          endDateIndex,
          bookedDays,
          minNights,
        }) &&
        (~endDateIndex
          ? !this.hasBlockedDaysInRange({
              startDate: day,
              endDate,
              bookedDays,
              blockedDays,
            })
          : true);

      if (!meetsMinNights) return true;
    } else if (focusedInput === this.END_DATE_INPUT_NAME) {
      const dateIndex = findIndex(bookedDays, (_day) => _day.date === date);
      const startDateIndex = startDate
        ? findIndex(
            bookedDays,
            (_day) => _day.date === this.getFormattedDate(startDate)
          )
        : -1;

      let firstBlockedDateIndex = startDate
        ? findIndex(
            bookedDays,
            (_day) =>
              blockedDays[_day.date] && !blockedDays[_day.date].isCheckIn,
            startDateIndex + 1
          )
        : -1;

      if (
        bookedDays[firstBlockedDateIndex] &&
        bookedDays[firstBlockedDateIndex].blocks.m &&
        bookedDays[firstBlockedDateIndex].blockRefs?.[0]?.startDate.startsWith(date)
      ) {
        firstBlockedDateIndex += 1;
      }

      const meetsMinNights =
        ~dateIndex &&
        (!~startDateIndex
          ? true
          : this.isEndDateForSelectedStartDate({
              dateIndex,
              startDateIndex,
              bookedDays,
              minNights:
                (~startDateIndex && bookedDays[startDateIndex].minNights) ||
                minNights,
              firstBlockedDateIndex,
            }));

      if (!meetsMinNights) {
        return true;
      }

      // TODO: max nights should be checked as well for end date with not selected start date
      const meetsMaxNightsRange =
        ~dateIndex &&
        (startDate
          ? this.meetsMaxNightsRange(
              findIndex(
                bookedDays,
                (_day) => _day.date === this.getFormattedDate(startDate)
              ),
              maxNights,
              dateIndex
            )
          : true);

      if (!meetsMaxNightsRange) {
        return true;
      }
    }
    return false;
  };

  onMonthChange(date) {
    const lastDate = moment(
      this.state.bookedDays[this.state.bookedDays.length - 1]?.date
    );
    const nextDate = date.add(6, "months");
    if (nextDate.isSameOrAfter(lastDate)) {
      const startDate = lastDate.add(1, "day").startOf('month');
      const endDate = startDate.clone().add(6, "months").endOf('month');
      this.props.getPropertyCalendar(startDate, endDate, false);
    }
  }

  meetsMaxNightsRange = (startIndex, maxNights, columnIndex) => {
    return columnIndex > startIndex && columnIndex <= startIndex + maxNights;
  };

  hasDaysOutsideOfRange = ({
    startDate,
    endDate,
    bookedDays,
    minNights,
    maxNights,
    blockedDays,
  }) => {
    // there is no booking days or start or end dates
    if (!bookedDays || !bookedDays.length || !startDate || !endDate) {
      return false;
    }

    if (this.isBeforeToday(startDate)) return true;

    // start date is after end date
    if (endDate.diff(startDate, "days") < 1) return true;

    const startDateIndex = this.getDateIndex(startDate, bookedDays);
    const endDateIndex = this.getDateIndex(endDate, bookedDays);
    // doesn't fit min nights rule
    const minimumNights = bookedDays[startDateIndex].minNights || minNights;
    if (endDateIndex - startDateIndex < minimumNights) return true;

    // doesn't fit max nights rule
    if (endDateIndex - startDateIndex > maxNights) return true;

    return this.hasBlockedDaysInRange({
      startDate,
      endDate,
      bookedDays,
      blockedDays,
    });
  };

  onDatesChange = (daysRange) => {
    const { endDate, startDate } = daysRange;
    const { focusedInput } = this.state;

    if (endDate && startDate && startDate.isAfter(endDate)) {
      this.setState({
        endDate: null,
        focusedInput: this.END_DATE_INPUT_NAME,
        isCalendarError: false,
        startDate,
      });
    } else if (endDate && startDate) {
      this.setState({ focusedInput: null }, () =>
        this.onDateRangeSelected({ endDate, startDate })
      );
    } else {
      this.setState({ endDate, startDate, isCalendarError: false });
    }
    this.props.onDatesChange(startDate, endDate);

    // reopen picker on clear action (to recalculate blocked and out of range dates)
    if (!startDate && !endDate && focusedInput) {
      this.reopenPicker();
    }
  };

  render() {
    return (
      <div>
        <DateRangePicker
          key={this.state.focusedInput}
          startDate={this.state.startDate}
          startDateId={"startDate_" + this.props.propertyId}
          endDate={this.state.endDate}
          minimumNights={this.state.minNights}
          endDateId={"endDate_" + this.props.propertyId}
          focusedInput={this.state.focusedInput}
          onPrevMonthClick={this.onMonthChange.bind(this)}
          onNextMonthClick={this.onMonthChange.bind(this)}
          onFocusChange={(focusedInput) => this.setState({ focusedInput })}
          startDatePlaceholderText={this.props.t("checkIn") + ":"}
          endDatePlaceholderText={this.props.t("checkOut") + ":"}
          isOutsideRange={this.isOutsideRange}
          renderDayContents={this.dayContentRenderer}
          showClearDates
          numberOfMonths={window.innerWidth < 992 ? 1 : 2}
          onDatesChange={this.onDatesChange}
          disabled={this.props.disabled}
        />
      </div>
    );
  }
}

export default withTranslation("details")(BookingCalendar);

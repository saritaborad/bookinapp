import moment from "moment";

export const calculateNumberOfDays = (from, to) => {
  return moment(to).diff(moment(from), "days");
};

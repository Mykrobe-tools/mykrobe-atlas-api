import moment from "moment";
import logger from "../modules/logging/logger";

const DATES_MAPPING = {
  "February 26, 207": "2007-02-26"
};

class DateHelper {
  static createValidDateFromString(stringValue, isolateId, errors) {
    if (!stringValue || "unknown" === stringValue) {
      return null;
    }

    if (DATES_MAPPING[stringValue]) {
      logger.warn(`DateHelper#createValidDateFromString: invalid date but mapped ${stringValue}`);
      errors.push(`${isolateId} invalid date ${stringValue}`);
      return DATES_MAPPING[stringValue];
    }

    let date;
    try {
      if (this.isYearOnly(stringValue)) {
        date = moment(stringValue, "YYYY");
      } else if (this.is2YearsAggregation(stringValue)) {
        const value = stringValue.split("/")[1];
        date = moment(value, "YYYY");
      } else if (this.isYearAndMonthOnly(stringValue)) {
        date = moment(stringValue, "YYYY-MM");
      } else if (this.isddMMMyyyy(stringValue)) {
        date = moment(stringValue, "DD-MMM-YYYY");
      } else if (this.isMMMyyyy(stringValue)) {
        date = moment(stringValue, "MMM-YYYY");
      } else if (this.isFullMonthYear(stringValue)) {
        date = moment(stringValue, "MMM-YYYY");
      } else if (this.isFullDate(stringValue)) {
        date = moment(stringValue, "DD-MMM-YYYY");
      } else if (this.isYearMonthDay(stringValue)) {
        date = moment(stringValue, "YYYY/MM/DD");
      } else if (this.isIsoDate(stringValue)) {
        date = moment(stringValue, "YYYY-MM-DD");
      }

      if (isNaN(date)) {
        logger.warn(`DateHelper#createValidDateFromString: invalid date ${stringValue}`);
        errors.push(`${isolateId} invalid date ${stringValue}`);
        return null;
      }

      return this.formatDate(date);
    } catch (e) {
      return null;
    }
  }

  static isYearOnly(value) {
    return value.match(/^\d{4}$/);
  }

  static is2YearsAggregation(value) {
    return value.match(/^\d{4}\/\d{4}$/);
  }

  static isYearAndMonthOnly(value) {
    return value.match(/^\d{4}\-\d{2}$/);
  }

  static isIsoDate(value) {
    return value.match(/^\d{4}\-\d{2}-\d{2}$/);
  }

  static isddMMMyyyy(value) {
    return value.match(
      /^(([0-9])|([0-2][0-9])|([3][0-1]))\-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-\d{4}$/
    );
  }

  static isYearMonthDay(value) {
    return value.match(/^\d{4}[\/.]\d{1,2}[\/.]\d{1,2}$/);
  }

  static isMMMyyyy(value) {
    return value.match(/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\-(\d{4}$)/);
  }

  static isFullMonthYear(value) {
    return value.match(
      /^(January|February|March|April|May|June|July|August|September|October|November|December)\-(\d{4}$)/
    );
  }

  static isFullDate(value) {
    return value.match(
      /^(([0-9])|([0-2][0-9])|([3][0-1]))\-(January|February|March|April|May|June|July|August|September|October|November|December)\-\d{4}$/
    );
  }

  static formatDate(date) {
    if (date) {
      return date.format("YYYY-MM-DD");
    }
    return null;
  }

  static validateRow(row, errors) {
    row.collection_date = this.createValidDateFromString(
      row.collection_date,
      row.sample_name,
      errors
    );
    row.date_arrived = this.createValidDateFromString(row.date_arrived, row.sample_name, errors);
  }
}

export default DateHelper;

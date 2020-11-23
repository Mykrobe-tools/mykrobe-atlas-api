import Constants from "../../Constants";

class LoggingUtil {
  isMetaMessage(message) {
    return message && message.meta && Object.keys(message.meta).length > 0;
  }

  getMessageSize(message = null) {
    if (message) {
      const size = Buffer.byteLength(JSON.stringify(message));
      return size;
    }

    return 0;
  }

  isMessageTooLarge(message = null) {
    if (message) {
      const size = this.getMessageSize(message);
      return this.isMessageSizeTooLarge(size);
    }
    return false;
  }

  isMessageSizeTooLarge(size = null) {
    if (size) {
      return size > Constants.LOG_MESSAGE_MAX_SIZE;
    }
    return false;
  }

  safe(message) {
    if (message) {
      const size = this.getMessageSize(message);
      if (size) {
        if (this.isMessageSizeTooLarge(size)) {
          const nice = this.niceBytes(size);
          return `Supressed logging large object (${nice})`;
        } else {
          return message;
        }
      } else {
        return message;
      }
    }

    return "";
  }

  niceBytes(value) {
    let l = 0,
      n = parseInt(value, 10) || 0;

    while (n >= 1024 && ++l) {
      n = n / 1024;
    }
    //include a decimal point and a tenths-place digit if presenting
    //less than ten of KB or greater units
    return n.toFixed(n < 10 && l > 0 ? 1 : 0) + " " + Constants.UNITS[l];
  }
}

const util = new LoggingUtil();
export default util;

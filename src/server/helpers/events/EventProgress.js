class EventProgress {
  constructor() {
    this.clear();
  }

  clear() {
    this.progress = {};
  }

  get(id) {
    return this.progress[id];
  }

  update(id, status) {
    this.progress[id] = status;
  }

  diff(id, status) {
    if (!id || !status) {
      return 0;
    }
    const current = this.progress[id] ? this.progress[id] : null;
    if (current === null) {
      const statusProgress =
        status.size && status.totalSize ? (status.size / status.totalSize) * 100 : 0;

      return statusProgress;
    } else {
      if (status.size && status.totalSize) {
        const currentProgress =
          current.size && current.totalSize ? (current.size / current.totalSize) * 100 : 0;
        const statusProgress =
          status.size && status.totalSize ? (status.size / status.totalSize) * 100 : 0;

        return statusProgress - currentProgress;
      } else {
        return 0;
      }
    }
  }
}

const progress = new EventProgress();
export default progress;

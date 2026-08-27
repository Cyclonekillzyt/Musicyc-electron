import { EventEmitter } from "events";

export class JobQueue extends EventEmitter {
  constructor(concurrency = 1) {
    super();
    this.concurrency = concurrency;
    this.active = 0;
    this.pending = [];
    this.jobs = new Map(); // id -> { status, progress, promise }
  }

  add(id, task) {
    const existing = this.jobs.get(id);
    if (existing && existing.status !== "failed") {
      return existing.promise;
    }

    let resolveFn, rejectFn;
    const promise = new Promise((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });

    this.jobs.set(id, { status: "queued", progress: 0, promise });
    this.pending.push({ id, task, resolveFn, rejectFn });
    this._next();
    return promise;
  }

  updateProgress(id, progress) {
    const job = this.jobs.get(id);
    if (!job) return;
    job.progress = progress;
    this.emit("progress", { id, progress });
  }

  getStatus(id) {
    return this.jobs.get(id) || null;
  }

  _next() {
    if (this.active >= this.concurrency || this.pending.length === 0) return;

    const { id, task, resolveFn, rejectFn } = this.pending.shift();
    const job = this.jobs.get(id);
    job.status = "active";
    this.active++;
    this.emit("start", { id });

    Promise.resolve()
      .then(() => task(id))
      .then((result) => {
        job.status = "done";
        job.progress = 100;
        this.emit("done", { id, result });
        resolveFn(result);
      })
      .catch((err) => {
        job.status = "failed";
        this.emit("failed", { id, error: err });
        rejectFn(err);
      })
      .finally(() => {
        this.active--;
        this._next();
      });
  }
}

export const downloadQueue = new JobQueue(1);
export const streamQueue = new JobQueue(2);

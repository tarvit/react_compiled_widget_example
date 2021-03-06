import dateFormat from 'dateformat';
import chunk from 'lodash/chunk';
import LoggerCommiter from "./logger/commiter";

export default class Logger {
  constructor(committer = new LoggerCommiter()) {
    this.output = true;
    this.totalRows = 0;
    this.maxTotalRows = 200;
    this.pendingInitialClean = true;
    this.networkEnabled = true;
    this.committer = committer;

    this.index = 0;
  }

  info(key, data) {
    if(this.pendingInitialClean) {
      this.cleanPrevRows();
      this.pendingInitialClean = false;
    }

    if(data) {
      if(this.output) console.log(`[${this.index}] ${key}`, data);
    } else {
      if(this.output) console.log(`[${this.index}] ${key}`);
    }
    const time = dateFormat(new Date(), "yyyy-mm-d h:MM:ss:l");
    this.write({
      index: this.index,
      time: time,
      details: this.details(),
      key: key,
      data: data
    });
    this.index++;
    this.totalRows++;
  }

  error(exception, extras = {}) {
    try {
      if(this.output) console.error(exception);
      const time = dateFormat(new Date(), "yyyy-mm-d h:MM:ss:l");
      const msg = {
        index: this.index,
        time: time,
        exception_message: exception.message,
        exception: exception,
        errorStack: exception.stack,
        logger_error: true,
        details: this.details(),
        extras: extras
      };

      this.write(msg);
      this.index++;
      this.totalRows++;

      this.push();
    } catch(e) {
      console.log('Caught:', e)
      // if(this.output) console.error('something went wrong');
      // console.error(e);
    }
  }

  write(message) {
    if(!this.isWriteEnabled()) return;

    const key = `logs.i${this.index}`;
    const extraRowsNumber = this.totalRows - this.maxTotalRows;
    if(extraRowsNumber > 0) {
      for(let i=0; i < extraRowsNumber; i++) {
        this.cleanOlderRow();
      }
    }
    localStorage.setItem(key, JSON.stringify(message));
  }

  push() {
    if(!this.networkEnabled) return;
    this.enableWrite();

    const keys = this.logKeys();
    const chunks = chunk(this.logRows(), 10);
    chunks.map((c, _index)=> { this.committer.commit(c); });
    for(let i=0; i < keys.length; i++) {
      localStorage.removeItem(keys[i]);
    }
  }

  cleanOlderRow() {
    const oldIndex = (this.index - this.totalRows);
    const key = `logs.i${oldIndex}`;
    localStorage.removeItem(key);
    this.totalRows--;
  }

  logKeys() {
    try {
      const keys = Object.keys(localStorage);
      return keys.filter((k) => { return k.startsWith('logs.i'); });
    } catch(e) {
      return [];
    }
  }

  logRows() {
    const res = [];
    const logKeys = this.logKeys();
    for(let i=0; i < logKeys.length; i++) {
      const item = JSON.parse(localStorage.getItem(logKeys[i]));
      res.push(item);
    }
    return res;
  }

  cleanPrevRows() {
    try {
      const logKeys = this.logKeys();
      for(let i=0; i < logKeys.length; i++) {
        localStorage.removeItem(logKeys[i]);
      }
    } catch(e) {
      console.error(e);
    }
  }

  isWriteEnabled() {
    try {
      return localStorage.getItem('logs.WriteEnabled')
    } catch(e) {
    }
  }

  enableWrite() {
    try {
      localStorage.setItem('logs.WriteEnabled', 1)
    } catch(e) {
    }
  }

  details() {
    try {
      // TODO add here real data from WPML (session_id, current_user, etc)
      const data = {};
      return data;
    } catch(e) {
      return {};
    }
  }
}


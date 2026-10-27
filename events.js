import { EventEmitter } from 'node:events';

const taskEvents = new EventEmitter({ captureRejections: true });

export default taskEvents;

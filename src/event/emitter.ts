import mitt from 'mitt';
import { Events } from './type';

const emitter = mitt<Events>();
export default emitter;

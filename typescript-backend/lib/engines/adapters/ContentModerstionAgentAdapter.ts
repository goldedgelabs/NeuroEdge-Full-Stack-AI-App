import mod from '../ContentModerstionAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'ContentModerstionAgent');
export default inst;

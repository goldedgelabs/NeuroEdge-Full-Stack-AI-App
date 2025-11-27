import mod from '../LearningAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'LearningAgent');
export default inst;

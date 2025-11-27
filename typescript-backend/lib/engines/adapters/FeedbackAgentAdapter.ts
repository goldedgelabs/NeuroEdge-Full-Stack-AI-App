import mod from '../FeedbackAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'FeedbackAgent');
export default inst;

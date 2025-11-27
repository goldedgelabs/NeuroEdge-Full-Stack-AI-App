import mod from '../ConversationAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'ConversationAgent');
export default inst;

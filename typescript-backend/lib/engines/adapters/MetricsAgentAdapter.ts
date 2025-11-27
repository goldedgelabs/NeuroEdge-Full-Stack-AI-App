import mod from '../MetricsAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'MetricsAgent');
export default inst;

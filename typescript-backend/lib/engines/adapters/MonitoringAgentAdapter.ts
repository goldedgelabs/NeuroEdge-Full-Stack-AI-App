import mod from '../MonitoringAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'MonitoringAgent');
export default inst;

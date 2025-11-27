import mod from '../AnalyticAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'AnalyticAgent');
export default inst;

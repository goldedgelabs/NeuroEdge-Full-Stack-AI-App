import mod from '../InspectionAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'InspectionAgent');
export default inst;

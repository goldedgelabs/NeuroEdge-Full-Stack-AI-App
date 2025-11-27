import mod from '../MedicineManagementAgent';
import { adaptModule } from '../adapterFactory';

const inst = adaptModule(mod, 'MedicineManagementAgent');
export default inst;

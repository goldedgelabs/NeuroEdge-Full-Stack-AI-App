export interface IEngine { name?: string; init?(): Promise<void>; run?(payload:any): Promise<any>; metrics?(): any; }
export default IEngine;

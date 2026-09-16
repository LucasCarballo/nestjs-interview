// Test mock for bcrypt — avoid hashing work in CI.
export const hash = async (_pw: string): Promise<string> => 'mocked.hash';
export const compare = async (_pw: string, _h: string): Promise<boolean> => true;
export const genSalt = async (): Promise<string> => 'mocked.salt';
export default { hash, compare, genSalt };

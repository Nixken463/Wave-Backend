export type checkToken =
  | { success: true; userId: string }
  | { success: false; userId: string }; 
import { create } from "zustand";

interface AppState {
  userSession: string | null;
  user: Record<string, any> | null;
  setUserSession: (session: string | null) => void;
  setUser: (user: Record<string, any> | null) => void;
}
export const useAppStore = create<AppState>((set) => ({
    userSession: null,
    user: null,
    setUserSession: (session: string | null) => {
      localStorage.setItem('userSession', session || '');
      set({ userSession: session });
    },
    setUser: (user: Record<string, any> | null) => set({ user }),
}))


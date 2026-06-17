import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserRole } from '../types';
import { mockAdminUser, mockUsers } from '../mock/mockData';

interface AuthState {
  currentUser: User | null;
  login: (userId: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: mockAdminUser,

      login: (userId: string) => {
        const found = mockUsers.find((u) => u.id === userId) ?? null;
        if (found) {
          set({
            currentUser: {
              ...found,
              activeViewRole: found.activeViewRole ?? found.role,
            },
          });
        }
      },

      logout: () => {
        set({ currentUser: null });
      },

      switchRole: (role: UserRole) => {
        const { currentUser } = get();
        if (currentUser) {
          set({
            currentUser: {
              ...currentUser,
              activeViewRole: role,
            },
          });
        }
      },
    }),
    {
      name: 'accelerator-auth-storage',
    },
  ),
);

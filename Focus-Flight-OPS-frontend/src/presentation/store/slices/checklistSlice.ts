import { create } from 'zustand';
import { checklistApi } from '../../../services/api/checklistApi';
import { syncManager } from '../../../infrastructure/sync/SyncManager';

export interface ChecklistItemState {
  id: string;
  templateItemId: string;
  textEs: string;
  isCritical: boolean;
  requiresPhoto: boolean;
  category: string;
  isChecked: boolean;
  note?: string;
}

export interface ChecklistPhaseState {
  type: string;
  nameEs: string;
  templateId: string;
  executionId?: string;
  items: ChecklistItemState[];
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'PASSED' | 'FAILED';
}

interface ChecklistStore {
  phases: ChecklistPhaseState[];
  currentPhaseIndex: number;
  isLoading: boolean;

  fetchTemplates: () => Promise<void>;
  toggleItem: (phaseType: string, itemId: string) => void;
  finalizePhase: (phaseType: string) => boolean;
  getCurrentPhase: () => ChecklistPhaseState | null;
  canProceedToNext: () => boolean;
  resetAll: () => void;
}

export const useChecklistStore = create<ChecklistStore>((set, get) => ({
  phases: [],
  currentPhaseIndex: 0,
  isLoading: false,

  fetchTemplates: async () => {
    set({ isLoading: true });
    try {
      const result = await syncManager.fetchWithFallback<any[]>(
        'checklist_templates',
        () => checklistApi.getTemplates(),
      );
      if (!result) {
        set({ isLoading: false });
        return;
      }
      const templates = result.data;
      const phases: ChecklistPhaseState[] = templates
        .filter((t: any) => t.type !== 'POST_FLIGHT')
        .map((t: any) => ({
          type: t.type,
          nameEs: t.nameEs,
          templateId: t.id,
          items: t.items.map((item: any) => ({
            id: item.id,
            templateItemId: item.id,
            textEs: item.textEs,
            isCritical: item.isCritical,
            requiresPhoto: item.requiresPhoto,
            category: item.categoryCode || '',
            isChecked: false,
          })),
          status: 'NOT_STARTED' as const,
        }));
      set({ phases, currentPhaseIndex: 0, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  // Local-first toggle - works without API execution
  toggleItem: (phaseType, itemId) => {
    set((s) => ({
      phases: s.phases.map((p) => {
        if (p.type !== phaseType) return p;
        return {
          ...p,
          status: p.status === 'NOT_STARTED' ? 'IN_PROGRESS' : p.status,
          items: p.items.map((i) =>
            i.id === itemId ? { ...i, isChecked: !i.isChecked } : i,
          ),
        };
      }),
    }));
  },

  finalizePhase: (phaseType) => {
    const state = get();
    const phase = state.phases.find((p) => p.type === phaseType);
    if (!phase) return false;

    const allCriticalChecked = phase.items
      .filter((i) => i.isCritical)
      .every((i) => i.isChecked);

    set((s) => ({
      phases: s.phases.map((p) => {
        if (p.type !== phaseType) return p;
        return {
          ...p,
          status: allCriticalChecked ? 'PASSED' as const : 'FAILED' as const,
        };
      }),
      currentPhaseIndex: allCriticalChecked
        ? Math.min(s.currentPhaseIndex + 1, s.phases.length - 1)
        : s.currentPhaseIndex,
    }));

    return allCriticalChecked;
  },

  getCurrentPhase: () => {
    const s = get();
    return s.phases[s.currentPhaseIndex] ?? null;
  },

  canProceedToNext: () => {
    const s = get();
    const current = s.phases[s.currentPhaseIndex];
    return current?.status === 'PASSED';
  },

  resetAll: () => set({ phases: [], currentPhaseIndex: 0 }),
}));

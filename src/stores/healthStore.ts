import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HealthMetric, HealthReminder } from '../types';
import { mockHealthMetrics } from '../mock/mockData';

interface HealthState {
  metrics: HealthMetric[];
  reminders: HealthReminder[];
  getMetricsByProject: (projectId: string) => HealthMetric[];
  getLatestMetricsByProject: (projectId: string) => HealthMetric | undefined;
  getOverdueProjects: () => string[];
  submitMetrics: (
    data: Partial<HealthMetric> & {
      projectId: string;
      projectName: string;
      metrics: HealthMetric['metrics'];
      overallScore: number;
      recordedBy: string;
    },
  ) => HealthMetric;
  isProjectOverdue: (projectId: string) => boolean;
  createReminder: (
    projectId: string,
    projectName: string,
    remindedBy?: string,
    batchId?: string,
  ) => HealthReminder;
  batchCreateReminders: (
    projects: { projectId: string; projectName: string }[],
    remindedBy?: string,
  ) => HealthReminder[];
  getRemindersByProject: (projectId: string) => HealthReminder[];
  getPendingReminders: () => HealthReminder[];
  markRemindersHandled: (projectId: string) => void;
}

const nowIso = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      metrics: mockHealthMetrics,
      reminders: [],

      getMetricsByProject: (projectId) => {
        return get()
          .metrics.filter((m) => m.projectId === projectId)
          .sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
      },

      getLatestMetricsByProject: (projectId) => {
        return get().getMetricsByProject(projectId)[0];
      },

      getOverdueProjects: () => {
        const now = Date.now();
        const latestByProject = new Map<string, number>();
        for (const m of get().metrics) {
          const ts = new Date(m.recordedAt).getTime();
          const existing = latestByProject.get(m.projectId);
          if (!existing || ts > existing) {
            latestByProject.set(m.projectId, ts);
          }
        }
        const overdue: string[] = [];
        for (const [projectId, ts] of latestByProject.entries()) {
          if (now - ts > SEVEN_DAYS_MS) {
            overdue.push(projectId);
          }
        }
        return overdue;
      },

      submitMetrics: (data) => {
        const metric: HealthMetric = {
          id: uid('hm_'),
          projectId: data.projectId,
          projectName: data.projectName,
          recordedAt: nowIso(),
          overallScore: data.overallScore,
          metrics: data.metrics,
          notes: data.notes ?? '',
          recordedBy: data.recordedBy,
        };
        const pendingForProject = get().reminders.filter(
          (r) => r.projectId === data.projectId && r.status === 'pending',
        );
        const updatedReminders =
          pendingForProject.length > 0
            ? get().reminders.map((r) =>
                r.projectId === data.projectId && r.status === 'pending'
                  ? { ...r, status: 'handled' as const, handledAt: nowIso() }
                  : r,
              )
            : get().reminders;
        set({
          metrics: [metric, ...get().metrics],
          reminders: updatedReminders,
        });
        return metric;
      },

      isProjectOverdue: (projectId) => {
        const latest = get().getLatestMetricsByProject(projectId);
        if (!latest) return true;
        return Date.now() - new Date(latest.recordedAt).getTime() > SEVEN_DAYS_MS;
      },

      createReminder: (projectId, projectName, remindedBy = 'system', batchId) => {
        const reminder: HealthReminder = {
          id: uid('hr_'),
          projectId,
          projectName,
          remindedAt: nowIso(),
          remindedBy,
          status: 'pending',
          batchId,
        };
        set({ reminders: [reminder, ...get().reminders] });
        return reminder;
      },

      batchCreateReminders: (projects, remindedBy = 'system') => {
        const batchId = `batch_${Date.now().toString(36)}`;
        const now = nowIso();
        const newReminders: HealthReminder[] = projects.map((p) => ({
          id: uid('hr_'),
          projectId: p.projectId,
          projectName: p.projectName,
          remindedAt: now,
          remindedBy,
          status: 'pending',
          batchId,
        }));
        set({ reminders: [...newReminders, ...get().reminders] });
        return newReminders;
      },

      getRemindersByProject: (projectId) => {
        return get()
          .reminders.filter((r) => r.projectId === projectId)
          .sort((a, b) => b.remindedAt.localeCompare(a.remindedAt));
      },

      getPendingReminders: () => {
        return get().reminders.filter((r) => r.status === 'pending');
      },

      markRemindersHandled: (projectId) => {
        const now = nowIso();
        set({
          reminders: get().reminders.map((r) =>
            r.projectId === projectId && r.status === 'pending'
              ? { ...r, status: 'handled' as const, handledAt: now }
              : r,
          ),
        });
      },
    }),
    {
      name: 'accelerator-health-storage',
    },
  ),
);

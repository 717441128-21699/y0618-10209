import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { HealthMetric } from '../types';
import { mockHealthMetrics } from '../mock/mockData';

interface HealthState {
  metrics: HealthMetric[];
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
}

const nowIso = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const useHealthStore = create<HealthState>()(
  persist(
    (set, get) => ({
      metrics: mockHealthMetrics,

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
        set({ metrics: [metric, ...get().metrics] });
        return metric;
      },

      isProjectOverdue: (projectId) => {
        const latest = get().getLatestMetricsByProject(projectId);
        if (!latest) return true;
        return Date.now() - new Date(latest.recordedAt).getTime() > SEVEN_DAYS_MS;
      },
    }),
    {
      name: 'accelerator-health-storage',
    },
  ),
);

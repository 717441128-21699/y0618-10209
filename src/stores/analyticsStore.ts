import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BatchStats, FunnelItem, MentorStat, ApplicationStatus } from '../types';
import {
  mockApplications,
  mockMentorAssignments,
  mockMeetingNotes,
  mockHealthMetrics,
} from '../mock/mockData';

const FUNNEL_STAGES: { stage: ApplicationStatus | 'funded'; label: string }[] = [
  { stage: 'submitted', label: '提交申请' },
  { stage: 'reviewing', label: '评审中' },
  { stage: 'accepted', label: '通过评审' },
  { stage: 'in_batch', label: '入营' },
  { stage: 'graduated', label: '毕业' },
  { stage: 'funded', label: '获得融资' },
];

interface BatchComparison {
  batch: string;
  applications: number;
  accepted: number;
  funded: number;
  conversionRate: number;
}

interface AnalyticsState {
  getBatchStats: (batch: string) => BatchStats;
  getFunnelData: () => FunnelItem[];
  getMentorStats: () => MentorStat[];
  getBatchComparison: () => BatchComparison[];
}

const FUNDED_STAGE_HINT = ['Pre-A轮', 'A轮', 'B轮', 'C轮'];

export const useAnalyticsStore = create<AnalyticsState>()(
  persist(
    (_, get) => ({
      getBatchStats: (batch) => {
        const apps = mockApplications.filter((a) => a.batch === batch);
        const accepted = apps.filter((a) =>
          ['accepted', 'in_batch', 'graduated'].includes(a.status),
        );
        const funded = apps.filter((a) => FUNDED_STAGE_HINT.includes(a.stage));
        return {
          applications: apps.length,
          accepted: accepted.length,
          funded: funded.length,
          conversionRate: apps.length > 0 ? accepted.length / apps.length : 0,
        };
      },

      getFunnelData: () => {
        const result: FunnelItem[] = [];
        const all = get ? undefined : mockApplications;
        const apps = all ?? mockApplications;

        for (const s of FUNNEL_STAGES) {
          if (s.stage === 'funded') {
            result.push({
              stage: 'funded',
              label: s.label,
              count: apps.filter((a) => FUNDED_STAGE_HINT.includes(a.stage)).length,
            });
          } else {
            const idx = FUNNEL_STAGES.findIndex((f) => f.stage === s.stage);
            const reachedStages = FUNNEL_STAGES.slice(0, idx + 1)
              .map((f) => f.stage)
              .filter((st): st is ApplicationStatus => st !== 'funded');
            result.push({
              stage: s.stage,
              label: s.label,
              count: apps.filter((a) => reachedStages.includes(a.status)).length,
            });
          }
        }
        return result;
      },

      getMentorStats: () => {
        const mentorMap = new Map<
          string,
          {
            mentorName: string;
            projectIds: Set<string>;
            meetingCount: number;
            fundedCount: number;
            healthScores: number[];
          }
        >();

        for (const a of mockMentorAssignments) {
          const entry = mentorMap.get(a.mentorId) ?? {
            mentorName: a.mentorName,
            projectIds: new Set<string>(),
            meetingCount: 0,
            fundedCount: 0,
            healthScores: [],
          };
          entry.projectIds.add(a.projectId);
          mentorMap.set(a.mentorId, entry);
        }

        for (const mn of mockMeetingNotes) {
          const entry = mentorMap.get(mn.mentorId);
          if (entry) entry.meetingCount++;
        }

        for (const a of mockApplications) {
          if (!FUNDED_STAGE_HINT.includes(a.stage)) continue;
          for (const ma of mockMentorAssignments) {
            if (ma.projectId !== a.id) continue;
            const entry = mentorMap.get(ma.mentorId);
            if (entry) entry.fundedCount++;
          }
        }

        const byProjHealth = new Map<string, number>();
        for (const m of mockHealthMetrics) {
          const existing = byProjHealth.get(m.projectId);
          if (!existing || m.overallScore > existing) {
            byProjHealth.set(m.projectId, m.overallScore);
          }
        }

        for (const a of mockMentorAssignments) {
          const entry = mentorMap.get(a.mentorId);
          const score = byProjHealth.get(a.projectId);
          if (entry && score != null) entry.healthScores.push(score);
        }

        return Array.from(mentorMap.entries()).map(([mentorId, info]) => ({
          mentorId,
          mentorName: info.mentorName,
          meetingCount: info.meetingCount,
          projectCount: info.projectIds.size,
          fundedProjectCount: info.fundedCount,
          avgProjectHealth:
            info.healthScores.length > 0
              ? info.healthScores.reduce((a, b) => a + b, 0) / info.healthScores.length
              : 0,
        }));
      },

      getBatchComparison: () => {
        const batches = Array.from(new Set(mockApplications.map((a) => a.batch))).filter(
          Boolean,
        );
        return batches
          .map((batch) => {
            const s = get?.().getBatchStats(batch) ?? (undefined as unknown as BatchStats);
            if (s?.applications != null) {
              return {
                batch,
                applications: s.applications,
                accepted: s.accepted,
                funded: s.funded,
                conversionRate: s.conversionRate,
              };
            }
            const apps = mockApplications.filter((a) => a.batch === batch);
            const accepted = apps.filter((a) =>
              ['accepted', 'in_batch', 'graduated'].includes(a.status),
            );
            const funded = apps.filter((a) => FUNDED_STAGE_HINT.includes(a.stage));
            return {
              batch,
              applications: apps.length,
              accepted: accepted.length,
              funded: funded.length,
              conversionRate: apps.length > 0 ? accepted.length / apps.length : 0,
            };
          })
          .sort((a, b) => a.batch.localeCompare(b.batch));
      },
    }),
    {
      name: 'accelerator-analytics-storage',
      partialize: () => ({}),
    },
  ),
);

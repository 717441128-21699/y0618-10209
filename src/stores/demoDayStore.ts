import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DemoDayEvent, DemoDayScore } from '../types';
import { mockDemoDayEvents, mockDemoDayScores } from '../mock/mockData';

interface ProjectRanking {
  projectId: string;
  projectName: string;
  averageScore: number;
  rank: number;
  scoreCount: number;
}

interface DemoDayState {
  demoDayEvents: DemoDayEvent[];
  demoDayScores: DemoDayScore[];
  getCurrentDemoDay: () => DemoDayEvent | undefined;
  getScoresByProject: (projectId: string) => DemoDayScore[];
  submitScore: (
    data: Partial<DemoDayScore> & {
      demoDayId: string;
      projectId: string;
      projectName: string;
      judgeId: string;
      judgeName: string;
      scores: DemoDayScore['scores'];
      comment: string;
    },
  ) => DemoDayScore;
  getProjectRankings: (demoDayId: string) => ProjectRanking[];
  updateProjectOrder: (demoDayId: string, projectId: string, newOrder: number) => void;
}

const nowIso = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

const calcAvg = (scores: DemoDayScore['scores']): number => {
  const vals = Object.values(scores);
  return vals.reduce((a, b) => a + b, 0) / vals.length;
};

export const useDemoDayStore = create<DemoDayState>()(
  persist(
    (set, get) => ({
      demoDayEvents: mockDemoDayEvents,
      demoDayScores: mockDemoDayScores,

      getCurrentDemoDay: () => {
        const upcoming = get()
          .demoDayEvents.filter((e) => e.status === 'upcoming')
          .sort((a, b) => a.date.localeCompare(b.date));
        if (upcoming.length > 0) return upcoming[0];
        const ongoing = get().demoDayEvents.find((e) => e.status === 'ongoing');
        if (ongoing) return ongoing;
        const completed = get()
          .demoDayEvents.filter((e) => e.status === 'completed')
          .sort((a, b) => b.date.localeCompare(a.date));
        return completed[0];
      },

      getScoresByProject: (projectId) => {
        return get().demoDayScores.filter((s) => s.projectId === projectId);
      },

      submitScore: (data) => {
        const score: DemoDayScore = {
          id: uid('dds_'),
          demoDayId: data.demoDayId,
          projectId: data.projectId,
          projectName: data.projectName,
          judgeId: data.judgeId,
          judgeName: data.judgeName,
          scores: data.scores,
          totalScore: calcAvg(data.scores),
          comment: data.comment,
          createdAt: nowIso(),
        };
        set({ demoDayScores: [score, ...get().demoDayScores] });
        return score;
      },

      getProjectRankings: (demoDayId) => {
        const scores = get().demoDayScores.filter((s) => s.demoDayId === demoDayId);
        const byProject = new Map<string, { projectName: string; totals: number[] }>();
        for (const s of scores) {
          const entry = byProject.get(s.projectId);
          if (entry) {
            entry.totals.push(s.totalScore);
          } else {
            byProject.set(s.projectId, {
              projectName: s.projectName,
              totals: [s.totalScore],
            });
          }
        }
        const ranked = Array.from(byProject.entries())
          .map(([projectId, info]) => ({
            projectId,
            projectName: info.projectName,
            averageScore:
              info.totals.reduce((a, b) => a + b, 0) / info.totals.length,
            scoreCount: info.totals.length,
            rank: 0,
          }))
          .sort((a, b) => b.averageScore - a.averageScore);

        ranked.forEach((item, idx) => {
          item.rank = idx + 1;
        });
        return ranked;
      },

      updateProjectOrder: (demoDayId, projectId, newOrder) => {
        set({
          demoDayEvents: get().demoDayEvents.map((e) => {
            if (e.id !== demoDayId) return e;
            const order = [...e.projectOrder];
            const currentIdx = order.indexOf(projectId);
            if (currentIdx === -1) return e;
            order.splice(currentIdx, 1);
            const target = Math.min(Math.max(newOrder - 1, 0), order.length);
            order.splice(target, 0, projectId);
            return { ...e, projectOrder: order };
          }),
        });
      },
    }),
    {
      name: 'accelerator-demoday-storage',
    },
  ),
);

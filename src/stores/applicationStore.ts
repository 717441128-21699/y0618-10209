import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Application, ApplicationStatus, Founder, Milestone } from '../types';
import { mockApplications } from '../mock/mockData';

interface ApplicationState {
  applications: Application[];
  drafts: Application[];
  getApplicationsByStatus: (status: ApplicationStatus) => Application[];
  getApplicationById: (id: string) => Application | undefined;
  createApplication: (data: Partial<Application>) => Application;
  updateApplication: (id: string, data: Partial<Application>) => void;
  submitApplication: (id: string) => void;
  updateApplicationStatus: (id: string, newStatus: ApplicationStatus) => void;
  addFounder: (applicationId: string, founder: Founder) => void;
  updateFounder: (applicationId: string, founderId: string, data: Partial<Founder>) => void;
  removeFounder: (applicationId: string, founderId: string) => void;
  addMilestone: (applicationId: string, milestone: Milestone) => void;
  updateMilestone: (applicationId: string, milestoneId: string, data: Partial<Milestone>) => void;
  removeMilestone: (applicationId: string, milestoneId: string) => void;
  saveDraft: (id: string, data: Partial<Application>) => void;
}

const nowIso = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useApplicationStore = create<ApplicationState>()(
  persist(
    (set, get) => ({
      applications: mockApplications,
      drafts: [],

      getApplicationsByStatus: (status) => {
        return get().applications.filter((a) => a.status === status);
      },

      getApplicationById: (id) => {
        const all = [...get().applications, ...get().drafts];
        return all.find((a) => a.id === id);
      },

      createApplication: (data) => {
        const id = data.id ?? uid('app_');
        const now = nowIso();
        const newApp: Application = {
          id,
          projectName: data.projectName ?? '新项目',
          projectDescription: data.projectDescription ?? '',
          founderName: data.founderName ?? '',
          founderContact: data.founderContact ?? '',
          teamSize: data.teamSize ?? 0,
          industry: data.industry ?? '',
          stage: data.stage ?? '种子轮',
          batch: data.batch ?? '',
          status: 'draft',
          createdAt: now,
          updatedAt: now,
          userId: data.userId ?? '',
          fundingRequested: data.fundingRequested ?? 0,
          tags: data.tags ?? [],
          oneLiner: data.oneLiner ?? '',
          problemStatement: data.problemStatement ?? '',
          solution: data.solution ?? '',
          targetMarket: data.targetMarket ?? '',
          businessModel: data.businessModel ?? '',
          revenueModel: data.revenueModel ?? '',
          competitiveAdvantage: data.competitiveAdvantage ?? '',
          competitorAnalysis: data.competitorAnalysis ?? '',
          productStatus: data.productStatus,
          userMetrics: data.userMetrics ?? '',
          businessProgress: data.businessProgress ?? '',
          milestones: data.milestones ?? [],
          equityOffered: data.equityOffered ?? 0,
          fundUsage: data.fundUsage ?? '',
          postFundingMilestones: data.postFundingMilestones ?? '',
          headquarters: data.headquarters ?? '',
          website: data.website ?? '',
          founders: data.founders ?? [],
          timeline: data.timeline ?? [
            {
              id: uid('tl_'),
              status: 'created',
              title: '创建申请',
              timestamp: now,
            },
          ],
          logo: data.logo,
          pitchUrl: data.pitchUrl,
        };
        if (data.status && data.status !== 'draft') {
          set({ applications: [newApp, ...get().applications] });
        } else {
          set({ drafts: [newApp, ...get().drafts] });
        }
        return newApp;
      },

      updateApplication: (id, data) => {
        const update = (list: Application[]): Application[] =>
          list.map((a) =>
            a.id === id ? { ...a, ...data, updatedAt: nowIso() } : a,
          );
        set({
          applications: update(get().applications),
          drafts: update(get().drafts),
        });
      },

      saveDraft: (id, data) => {
        get().updateApplication(id, data);
      },

      submitApplication: (id) => {
        const { drafts, applications } = get();
        const draftIdx = drafts.findIndex((d) => d.id === id);
        if (draftIdx >= 0) {
          const now = nowIso();
          const submitted: Application = {
            ...drafts[draftIdx],
            status: 'submitted',
            submittedAt: now,
            updatedAt: now,
            timeline: [
              ...(drafts[draftIdx].timeline ?? []),
              {
                id: uid('tl_'),
                status: 'submitted',
                title: '提交申请',
                timestamp: now,
              },
            ],
          };
          const newDrafts = drafts.filter((_, i) => i !== draftIdx);
          set({
            drafts: newDrafts,
            applications: [submitted, ...applications],
          });
          return;
        }
        get().updateApplicationStatus(id, 'submitted');
      },

      updateApplicationStatus: (id, newStatus) => {
        const now = nowIso();
        const statusTitleMap: Record<ApplicationStatus, string> = {
          draft: '保存草稿',
          submitted: '提交申请',
          reviewing: '开始评审',
          reviewed: '完成评审',
          accepted: '初审通过',
          rejected: '申请拒绝',
          in_batch: '确认入营',
          graduated: '项目毕业',
        };
        set({
          applications: get().applications.map((a) =>
            a.id === id
              ? {
                  ...a,
                  status: newStatus,
                  updatedAt: now,
                  submittedAt:
                    a.submittedAt ??
                    (['submitted', 'reviewing', 'reviewed', 'accepted', 'rejected', 'in_batch', 'graduated'].includes(
                      newStatus,
                    )
                      ? now
                      : a.submittedAt),
                  timeline: [
                    ...(a.timeline ?? []),
                    {
                      id: uid('tl_'),
                      status: newStatus,
                      title: statusTitleMap[newStatus] ?? newStatus,
                      timestamp: now,
                    },
                  ],
                }
              : a,
          ),
        });
      },

      addFounder: (applicationId, founder) => {
        const update = (list: Application[]): Application[] =>
          list.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  founders: [...(a.founders ?? []), founder],
                  updatedAt: nowIso(),
                }
              : a,
          );
        set({
          applications: update(get().applications),
          drafts: update(get().drafts),
        });
      },

      updateFounder: (applicationId, founderId, data) => {
        const update = (list: Application[]): Application[] =>
          list.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  founders: (a.founders ?? []).map((f) =>
                    f.id === founderId ? { ...f, ...data } : f,
                  ),
                  updatedAt: nowIso(),
                }
              : a,
          );
        set({
          applications: update(get().applications),
          drafts: update(get().drafts),
        });
      },

      removeFounder: (applicationId, founderId) => {
        const update = (list: Application[]): Application[] =>
          list.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  founders: (a.founders ?? []).filter((f) => f.id !== founderId),
                  updatedAt: nowIso(),
                }
              : a,
          );
        set({
          applications: update(get().applications),
          drafts: update(get().drafts),
        });
      },

      addMilestone: (applicationId, milestone) => {
        const update = (list: Application[]): Application[] =>
          list.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  milestones: [...(a.milestones ?? []), milestone],
                  updatedAt: nowIso(),
                }
              : a,
          );
        set({
          applications: update(get().applications),
          drafts: update(get().drafts),
        });
      },

      updateMilestone: (applicationId, milestoneId, data) => {
        const update = (list: Application[]): Application[] =>
          list.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  milestones: (a.milestones ?? []).map((m) =>
                    m.id === milestoneId ? { ...m, ...data } : m,
                  ),
                  updatedAt: nowIso(),
                }
              : a,
          );
        set({
          applications: update(get().applications),
          drafts: update(get().drafts),
        });
      },

      removeMilestone: (applicationId, milestoneId) => {
        const update = (list: Application[]): Application[] =>
          list.map((a) =>
            a.id === applicationId
              ? {
                  ...a,
                  milestones: (a.milestones ?? []).filter((m) => m.id !== milestoneId),
                  updatedAt: nowIso(),
                }
              : a,
          );
        set({
          applications: update(get().applications),
          drafts: update(get().drafts),
        });
      },
    }),
    {
      name: 'accelerator-application-storage',
    },
  ),
);

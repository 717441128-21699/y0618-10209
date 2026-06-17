import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { MentorAssignment, MeetingNote, ActionItem } from '../types';
import { mockMentorAssignments, mockMeetingNotes } from '../mock/mockData';

interface MentoringState {
  assignments: MentorAssignment[];
  meetingNotes: MeetingNote[];
  getAssignmentsByMentor: (mentorId: string) => MentorAssignment[];
  getAssignmentsByProject: (projectId: string) => MentorAssignment[];
  createAssignment: (
    data: Partial<MentorAssignment> & {
      mentorId: string;
      mentorName: string;
      projectId: string;
      projectName: string;
    },
  ) => MentorAssignment;
  createMeetingNote: (
    data: Partial<MeetingNote> & {
      assignmentId: string;
      projectId: string;
      mentorId: string;
      meetingDate: string;
      duration: number;
      summary: string;
    },
  ) => MeetingNote;
  updateActionItemStatus: (
    meetingId: string,
    actionId: string,
    status: ActionItem['status'],
  ) => void;
  updateMeetingNote: (
    meetingId: string,
    data: Partial<Pick<MeetingNote, 'meetingDate' | 'duration' | 'summary' | 'actionItems'>>,
  ) => void;
}

const nowIso = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useMentoringStore = create<MentoringState>()(
  persist(
    (set, get) => ({
      assignments: mockMentorAssignments,
      meetingNotes: mockMeetingNotes,

      getAssignmentsByMentor: (mentorId) => {
        return get().assignments.filter((a) => a.mentorId === mentorId);
      },

      getAssignmentsByProject: (projectId) => {
        return get().assignments.filter((a) => a.projectId === projectId);
      },

      createAssignment: (data) => {
        const assignment: MentorAssignment = {
          id: uid('ma_'),
          mentorId: data.mentorId,
          mentorName: data.mentorName,
          projectId: data.projectId,
          projectName: data.projectName,
          startDate: data.startDate ?? nowIso(),
          endDate: data.endDate,
          status: data.status ?? 'active',
          focusAreas: data.focusAreas ?? [],
        };
        set({ assignments: [assignment, ...get().assignments] });
        return assignment;
      },

      createMeetingNote: (data) => {
        const note: MeetingNote = {
          id: uid('mn_'),
          assignmentId: data.assignmentId,
          projectId: data.projectId,
          mentorId: data.mentorId,
          meetingDate: data.meetingDate,
          duration: data.duration,
          summary: data.summary,
          actionItems: data.actionItems ?? [],
          createdAt: nowIso(),
        };
        set({ meetingNotes: [note, ...get().meetingNotes] });
        return note;
      },

      updateActionItemStatus: (meetingId, actionId, status) => {
        set({
          meetingNotes: get().meetingNotes.map((mn) => {
            if (mn.id !== meetingId) return mn;
            return {
              ...mn,
              actionItems: mn.actionItems.map((ai) =>
                ai.id === actionId ? { ...ai, status } : ai,
              ),
            };
          }),
        });
      },

      updateMeetingNote: (meetingId, data) => {
        set({
          meetingNotes: get().meetingNotes.map((mn) => {
            if (mn.id !== meetingId) return mn;
            const updatedActionItems =
              data.actionItems !== undefined ? data.actionItems : mn.actionItems;
            return {
              ...mn,
              meetingDate: data.meetingDate ?? mn.meetingDate,
              duration: data.duration ?? mn.duration,
              summary: data.summary ?? mn.summary,
              actionItems: updatedActionItems,
            };
          }),
        });
      },
    }),
    {
      name: 'accelerator-mentoring-storage',
    },
  ),
);

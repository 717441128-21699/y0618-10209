import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Review, Defense, ReviewScore, ReviewConclusion } from '../types';
import { mockReviews, mockDefenses } from '../mock/mockData';

interface ReviewState {
  reviews: Review[];
  defenses: Defense[];
  getReviewsByApplication: (applicationId: string) => Review[];
  createReview: (data: {
    applicationId: string;
    reviewerId: string;
    reviewerName: string;
    criteriaScores: ReviewScore;
    score: number;
    comment?: string;
    conclusion?: ReviewConclusion;
    strengths?: string[];
    concerns?: string[];
    generalComment?: string;
    status?: 'pending' | 'completed';
  }) => Review;
  updateReview: (reviewId: string, data: Partial<Review>) => void;
  getPendingReviews: (reviewerId: string) => Review[];
  getCompletedReviews: (reviewerId: string) => Review[];
  scheduleDefense: (
    applicationId: string,
    data: Partial<Defense> & { title: string; scheduledAt: string; location: string; panelIds: string[] },
  ) => Defense;
  completeDefense: (
    defenseId: string,
    result: 'pass' | 'fail' | 'conditional',
    score: number,
    notes?: string,
  ) => void;
}

const nowIso = () => new Date().toISOString();
const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

export const useReviewStore = create<ReviewState>()(
  persist(
    (set, get) => ({
      reviews: mockReviews,
      defenses: mockDefenses,

      getReviewsByApplication: (applicationId) => {
        return get().reviews.filter((r) => r.applicationId === applicationId);
      },

      createReview: (data) => {
        const now = nowIso();
        const review: Review = {
          id: uid('r_'),
          applicationId: data.applicationId,
          reviewerId: data.reviewerId,
          reviewerName: data.reviewerName,
          score: data.score,
          comment: data.comment ?? data.generalComment ?? '',
          criteriaScores: data.criteriaScores,
          status: data.status ?? (data.score > 0 ? 'completed' : 'pending'),
          createdAt: now,
          updatedAt: now,
          conclusion: data.conclusion,
          strengths: data.strengths ?? [],
          concerns: data.concerns ?? [],
          generalComment: data.generalComment ?? data.comment ?? '',
        };
        set({ reviews: [review, ...get().reviews] });
        return review;
      },

      updateReview: (reviewId, data) => {
        set({
          reviews: get().reviews.map((r) =>
            r.id === reviewId ? { ...r, ...data, updatedAt: nowIso() } : r,
          ),
        });
      },

      getPendingReviews: (reviewerId) => {
        return get().reviews.filter(
          (r) => r.reviewerId === reviewerId && r.status === 'pending',
        );
      },

      getCompletedReviews: (reviewerId) => {
        return get().reviews.filter(
          (r) => r.reviewerId === reviewerId && r.status === 'completed',
        );
      },

      scheduleDefense: (applicationId, data) => {
        const defense: Defense = {
          id: uid('d_'),
          applicationId,
          title: data.title,
          scheduledAt: data.scheduledAt,
          location: data.location,
          panelIds: data.panelIds,
          completed: false,
          createdAt: nowIso(),
        };
        set({ defenses: [defense, ...get().defenses] });
        return defense;
      },

      completeDefense: (defenseId, result, score, notes) => {
        set({
          defenses: get().defenses.map((d) =>
            d.id === defenseId
              ? { ...d, completed: true, result, score, notes: notes ?? d.notes }
              : d,
          ),
        });
      },
    }),
    {
      name: 'accelerator-review-storage',
    },
  ),
);

export type UserRole = 'admin' | 'applicant' | 'reviewer' | 'mentor' | 'investor';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  organization?: string;
  activeViewRole?: UserRole;
}

export type ApplicationStatus =
  | 'draft'
  | 'submitted'
  | 'reviewing'
  | 'reviewed'
  | 'accepted'
  | 'rejected'
  | 'in_batch'
  | 'graduated';

export interface Founder {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  background: string;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  completed: boolean;
}

export interface TimelineEvent {
  id: string;
  status: ApplicationStatus | 'created';
  title: string;
  description?: string;
  timestamp: string;
  operator?: string;
}

export interface Application {
  id: string;
  projectName: string;
  projectDescription: string;
  founderName: string;
  founderContact: string;
  teamSize: number;
  industry: string;
  stage: string;
  batch: string;
  status: ApplicationStatus;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  fundingRequested: number;
  pitchUrl?: string;
  tags: string[];
  oneLiner?: string;
  problemStatement?: string;
  solution?: string;
  targetMarket?: string;
  businessModel?: string;
  revenueModel?: string;
  competitiveAdvantage?: string;
  competitorAnalysis?: string;
  productStatus?: 'concept' | 'prototype' | 'mvp' | 'has_users';
  userMetrics?: string;
  businessProgress?: string;
  milestones?: Milestone[];
  equityOffered?: number;
  fundUsage?: string;
  postFundingMilestones?: string;
  headquarters?: string;
  website?: string;
  founders?: Founder[];
  timeline?: TimelineEvent[];
  logo?: string;
}

export interface ReviewScore {
  team: number;
  market: number;
  product: number;
  business: number;
  funding: number;
}

export type ReviewConclusion = 'advance' | 'pending' | 'reject';

export interface ReviewTags {
  strengths: string[];
  concerns: string[];
}

export interface Review {
  id: string;
  applicationId: string;
  reviewerId: string;
  reviewerName: string;
  score: number;
  comment: string;
  criteriaScores: ReviewScore;
  status: 'pending' | 'completed';
  createdAt: string;
  updatedAt: string;
  conclusion?: ReviewConclusion;
  strengths?: string[];
  concerns?: string[];
  generalComment?: string;
  legacyScores?: {
    team: number;
    market: number;
    product: number;
    traction: number;
  };
}

export interface Defense {
  id: string;
  applicationId: string;
  title: string;
  scheduledAt: string;
  location: string;
  panelIds: string[];
  result?: 'pass' | 'fail' | 'conditional';
  score?: number;
  notes?: string;
  completed: boolean;
  createdAt: string;
}

export interface MentorAssignment {
  id: string;
  mentorId: string;
  mentorName: string;
  projectId: string;
  projectName: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  focusAreas: string[];
}

export interface ActionItem {
  id: string;
  description: string;
  assignee: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface MeetingNote {
  id: string;
  assignmentId: string;
  projectId: string;
  mentorId: string;
  meetingDate: string;
  duration: number;
  summary: string;
  actionItems: ActionItem[];
  createdAt: string;
}

export interface HealthMetric {
  id: string;
  projectId: string;
  projectName: string;
  recordedAt: string;
  overallScore: number;
  metrics: {
    teamHealth: number;
    productProgress: number;
    marketFit: number;
    financialHealth: number;
  };
  notes: string;
  recordedBy: string;
}

export interface DemoDayEvent {
  id: string;
  name: string;
  batch: string;
  date: string;
  location: string;
  projectOrder: string[];
  status: 'upcoming' | 'ongoing' | 'completed';
  description?: string;
}

export interface DemoDayScore {
  id: string;
  demoDayId: string;
  projectId: string;
  projectName: string;
  judgeId: string;
  judgeName: string;
  scores: {
    innovation: number;
    presentation: number;
    marketPotential: number;
    teamCapability: number;
    traction: number;
  };
  totalScore: number;
  comment: string;
  createdAt: string;
}

export interface BatchStats {
  applications: number;
  accepted: number;
  funded: number;
  conversionRate: number;
}

export interface FunnelItem {
  stage: string;
  count: number;
  label: string;
}

export interface MentorStat {
  mentorId: string;
  mentorName: string;
  meetingCount: number;
  projectCount: number;
  fundedProjectCount: number;
  avgProjectHealth: number;
}

export interface ReviewScore {
  team: number;
  market: number;
  product: number;
  business: number;
  funding: number;
}

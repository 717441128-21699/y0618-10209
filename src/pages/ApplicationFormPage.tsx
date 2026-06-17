import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  Plus,
  X,
  CheckCircle2,
  Globe,
  Building2,
  UserPlus,
  CalendarDays,
  CheckSquare,
  Square,
} from 'lucide-react';
import { PageContainer } from '@/components/layout';
import {
  Button,
  Stepper,
  type StepperStep,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/common';
import { useApplicationStore } from '@/stores/applicationStore';
import { useAuthStore } from '@/stores/authStore';
import type { Founder, Milestone, Application } from '@/types';
import { cn } from '@/lib/utils';

const STEPS: StepperStep[] = [
  { label: '基础信息', icon: <FileText className="w-5 h-5" /> },
  { label: '项目介绍', icon: <Target className="w-5 h-5" /> },
  { label: '商业模式', icon: <TrendingUp className="w-5 h-5" /> },
  { label: '当前进展', icon: <CheckCircle2 className="w-5 h-5" /> },
  { label: '融资需求', icon: <DollarSign className="w-5 h-5" /> },
];

const INDUSTRY_OPTIONS = [
  '人工智能', '新能源', '医疗健康', '企业服务',
  '农业科技', '硬件', '物流', '教育科技', '消费', '金融科技', '其他',
];
const STAGE_OPTIONS = ['种子轮', '天使轮', 'Pre-A轮', 'A轮', 'B轮', 'C轮及以上'];
const PRODUCT_STATUS_OPTIONS = [
  { value: 'concept', label: '概念阶段' },
  { value: 'prototype', label: '原型开发' },
  { value: 'mvp', label: 'MVP上线' },
  { value: 'has_users', label: '已有用户' },
] as const;

const uid = (p: string) =>
  `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;

interface FormState extends Partial<Application> {}

const inputBase =
  'w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all';
const textareaBase =
  'w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition-all resize-none leading-relaxed';
const labelBase = 'block text-sm font-semibold text-slate-700 mb-2';
const sectionBase = 'space-y-5';

function Toast({ message, variant = 'success' }: { message: string; variant?: 'success' | 'info' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className={cn(
        'fixed top-6 left-1/2 -translate-x-1/2 z-[100] px-5 py-3 rounded-xl shadow-xl flex items-center gap-2.5',
        variant === 'success' && 'bg-emerald-600 text-white shadow-emerald-300/40',
        variant === 'info' && 'bg-slate-800 text-white shadow-slate-300/40',
      )}
    >
      <CheckCircle2 className="w-5 h-5" />
      <span className="text-sm font-medium">{message}</span>
    </motion.div>
  );
}

export default function ApplicationFormPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isEditing = id && id !== 'new';

  const { currentUser } = useAuthStore();
  const {
    getApplicationById,
    createApplication,
    updateApplication,
    submitApplication,
  } = useApplicationStore();

  const [currentStep, setCurrentStep] = useState(0);
  const [toast, setToast] = useState<{ message: string; variant?: 'success' | 'info' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const existingApp = isEditing ? getApplicationById(id!) : undefined;

  const [form, setForm] = useState<FormState>(() => {
    if (existingApp) {
      return { ...existingApp };
    }
    return {
      projectName: '',
      industry: '',
      stage: '种子轮',
      headquarters: '',
      teamSize: 0,
      website: '',
      founders: [],
      oneLiner: '',
      problemStatement: '',
      solution: '',
      targetMarket: '',
      businessModel: '',
      revenueModel: '',
      competitiveAdvantage: '',
      competitorAnalysis: '',
      productStatus: 'concept',
      userMetrics: '',
      businessProgress: '',
      milestones: [],
      fundingRequested: 0,
      equityOffered: 0,
      fundUsage: '',
      postFundingMilestones: '',
      tags: [],
      batch: '2026-Spring',
      userId: currentUser?.id ?? '',
      founderName: '',
      founderContact: '',
      projectDescription: '',
    };
  });

  useEffect(() => {
    if (isEditing && existingApp) {
      setForm({ ...existingApp });
    }
  }, [isEditing, existingApp?.id]);

  const showToast = useCallback((message: string, variant?: 'success' | 'info') => {
    setToast({ message, variant });
    setTimeout(() => setToast(null), 2500);
  }, []);

  const updateField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSaveDraft = async () => {
    if (isEditing) {
      updateApplication(id!, form as Partial<Application>);
    } else {
      const created = createApplication({
        ...form,
        userId: currentUser?.id ?? 'u2',
        founderName: form.founders?.[0]?.name ?? form.founderName ?? '未填写',
        founderContact: form.founders?.[0]?.phone ?? form.founderContact ?? '',
        projectDescription: form.oneLiner ?? form.projectName ?? '',
      } as Partial<Application>);
      navigate(`/applications/${created.id}/edit`, { replace: true });
    }
    showToast('草稿保存成功', 'success');
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      let appId: string;
      if (isEditing) {
        updateApplication(id!, {
          ...form,
          founderName: form.founders?.[0]?.name ?? form.founderName ?? '未填写',
          founderContact: form.founders?.[0]?.phone ?? form.founderContact ?? '',
          projectDescription: form.oneLiner ?? form.projectName ?? '',
        } as Partial<Application>);
        appId = id!;
      } else {
        const created = createApplication({
          ...form,
          userId: currentUser?.id ?? 'u2',
          founderName: form.founders?.[0]?.name ?? form.founderName ?? '未填写',
          founderContact: form.founders?.[0]?.phone ?? form.founderContact ?? '',
          projectDescription: form.oneLiner ?? form.projectName ?? '',
        } as Partial<Application>);
        appId = created.id;
      }
      submitApplication(appId);
      showToast('申请提交成功！', 'success');
      setTimeout(() => navigate('/applications'), 1200);
    } finally {
      setIsSubmitting(false);
    }
  };

  const addFounder = () => {
    const newFounder: Founder = {
      id: uid('f_'),
      name: '',
      title: '',
      email: '',
      phone: '',
      background: '',
    };
    updateField('founders', [...(form.founders ?? []), newFounder]);
  };

  const updateFounder = (fid: string, patch: Partial<Founder>) => {
    updateField(
      'founders',
      (form.founders ?? []).map((f) => (f.id === fid ? { ...f, ...patch } : f)),
    );
  };

  const removeFounder = (fid: string) => {
    updateField('founders', (form.founders ?? []).filter((f) => f.id !== fid));
  };

  const addMilestone = () => {
    const newMs: Milestone = {
      id: uid('m_'),
      title: '',
      date: new Date().toISOString().slice(0, 10),
      description: '',
      completed: false,
    };
    updateField('milestones', [...(form.milestones ?? []), newMs]);
  };

  const updateMilestone = (mid: string, patch: Partial<Milestone>) => {
    updateField(
      'milestones',
      (form.milestones ?? []).map((m) => (m.id === mid ? { ...m, ...patch } : m)),
    );
  };

  const removeMilestone = (mid: string) => {
    updateField('milestones', (form.milestones ?? []).filter((m) => m.id !== mid));
  };

  const nextStep = () => setCurrentStep((s) => Math.min(STEPS.length - 1, s + 1));
  const prevStep = () => setCurrentStep((s) => Math.max(0, s - 1));

  const fieldRow = (label: string, required?: boolean) => (
    <div>
      <label className={labelBase}>
        {label} {required && <span className="text-rose-500 ml-0.5">*</span>}
      </label>
    </div>
  );

  return (
    <PageContainer
      title={isEditing ? '编辑入营申请' : '入营申请表'}
      subtitle="请认真填写以下信息，资料越完善越有助于评审团队快速了解您的项目"
      actions={
        <div className="flex items-center gap-2">
          <Badge variant="slate" className="text-xs px-3 py-1">
            {isEditing ? '编辑模式' : '新建申请'}
          </Badge>
        </div>
      }
    >
      <AnimatePresence>{toast && <Toast message={toast.message} variant={toast.variant} />}</AnimatePresence>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="p-6">
            <Stepper
              steps={STEPS}
              currentStep={currentStep}
              onStepClick={(idx) => setCurrentStep(idx)}
              allowClickBack
            />
          </Card>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 30, y: 8 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: -30, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <Card className="overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50/50 to-indigo-50/30 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center [&_svg]:w-5 [&_svg]:h-5">
                    {STEPS[currentStep].icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      第{currentStep + 1}步 · {STEPS[currentStep].label}
                    </CardTitle>
                    <p className="text-xs text-slate-500 mt-0.5">
                      请填写以下信息，带 * 号为必填项
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 sm:p-8">
                {currentStep === 0 && (
                  <div className={sectionBase}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="md:col-span-2">
                        {fieldRow('项目名称', true)}
                        <input
                          className={inputBase}
                          placeholder="请输入项目全称"
                          value={form.projectName ?? ''}
                          onChange={(e) => updateField('projectName', e.target.value)}
                        />
                      </div>
                      <div>
                        {fieldRow('所属行业', true)}
                        <select
                          className={inputBase}
                          value={form.industry ?? ''}
                          onChange={(e) => updateField('industry', e.target.value)}
                        >
                          <option value="">请选择行业</option>
                          {INDUSTRY_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        {fieldRow('融资阶段', true)}
                        <select
                          className={inputBase}
                          value={form.stage ?? '种子轮'}
                          onChange={(e) => updateField('stage', e.target.value)}
                        >
                          {STAGE_OPTIONS.map((o) => (
                            <option key={o} value={o}>{o}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        {fieldRow('总部所在地')}
                        <div className="relative">
                          <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            className={cn(inputBase, 'pl-10')}
                            placeholder="如：北京市海淀区"
                            value={form.headquarters ?? ''}
                            onChange={(e) => updateField('headquarters', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        {fieldRow('团队人数', true)}
                        <input
                          type="number"
                          min={0}
                          className={inputBase}
                          placeholder="请输入团队人数"
                          value={form.teamSize ?? ''}
                          onChange={(e) => updateField('teamSize', Number(e.target.value))}
                        />
                      </div>
                      <div className="md:col-span-2">
                        {fieldRow('官方网站')}
                        <div className="relative">
                          <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            className={cn(inputBase, 'pl-10')}
                            placeholder="https://yourstartup.com"
                            value={form.website ?? ''}
                            onChange={(e) => updateField('website', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-slate-700">核心创始人团队</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<UserPlus className="w-3.5 h-3.5" />}
                          onClick={addFounder}
                          className="h-8"
                        >
                          添加创始人
                        </Button>
                      </div>

                      {(!form.founders || form.founders.length === 0) && (
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-6 text-center">
                          <p className="text-sm text-slate-500">还没有添加创始人信息</p>
                          <p className="text-xs text-slate-400 mt-1">点击右上角「添加创始人」按钮开始填写</p>
                        </div>
                      )}

                      <div className="space-y-4">
                        {(form.founders ?? []).map((f, idx) => (
                          <motion.div
                            key={f.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-slate-200 bg-slate-50/30 p-5 relative"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <Badge variant="indigo" className="text-xs">
                                创始人 {idx + 1}
                              </Badge>
                              <button
                                onClick={() => removeFounder(f.id)}
                                className="text-slate-400 hover:text-rose-500 transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">姓名</label>
                                <input
                                  className={inputBase}
                                  placeholder="如：张三"
                                  value={f.name}
                                  onChange={(e) => updateFounder(f.id, { name: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">职位</label>
                                <input
                                  className={inputBase}
                                  placeholder="如：CEO / CTO"
                                  value={f.title}
                                  onChange={(e) => updateFounder(f.id, { title: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">邮箱</label>
                                <input
                                  type="email"
                                  className={inputBase}
                                  placeholder="founder@startup.com"
                                  value={f.email}
                                  onChange={(e) => updateFounder(f.id, { email: e.target.value })}
                                />
                              </div>
                              <div>
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">手机号</label>
                                <input
                                  className={inputBase}
                                  placeholder="请输入手机号"
                                  value={f.phone}
                                  onChange={(e) => updateFounder(f.id, { phone: e.target.value })}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="text-xs font-semibold text-slate-600 mb-1.5 block">背景经历</label>
                                <textarea
                                  className={cn(textareaBase, 'h-20')}
                                  placeholder="教育背景、工作经历、相关成就等，有助于评审了解团队实力"
                                  value={f.background}
                                  onChange={(e) => updateFounder(f.id, { background: e.target.value })}
                                />
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 1 && (
                  <div className={sectionBase}>
                    <div>
                      {fieldRow('一句话介绍', true)}
                      <textarea
                        className={cn(textareaBase, 'h-20')}
                        placeholder="用最简洁的语言描述您的项目，30字以内最佳"
                        maxLength={100}
                        value={form.oneLiner ?? ''}
                        onChange={(e) => updateField('oneLiner', e.target.value)}
                      />
                      <div className="flex justify-end mt-1">
                        <span className="text-[11px] text-slate-400">{(form.oneLiner ?? '').length}/100</span>
                      </div>
                    </div>

                    <div>
                      {fieldRow('问题描述', true)}
                      <textarea
                        className={cn(textareaBase, 'h-28')}
                        placeholder="您的项目要解决什么具体问题？这个问题影响了哪些人？目前市场上的解决方案有什么痛点？"
                        value={form.problemStatement ?? ''}
                        onChange={(e) => updateField('problemStatement', e.target.value)}
                      />
                    </div>

                    <div>
                      {fieldRow('解决方案', true)}
                      <textarea
                        className={cn(textareaBase, 'h-28')}
                        placeholder="您的产品/服务如何解决上述问题？核心技术或创新点是什么？"
                        value={form.solution ?? ''}
                        onChange={(e) => updateField('solution', e.target.value)}
                      />
                    </div>

                    <div>
                      {fieldRow('目标市场')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="目标客户画像、市场规模估算（TAM/SAM/SOM）、行业增长趋势"
                        value={form.targetMarket ?? ''}
                        onChange={(e) => updateField('targetMarket', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 2 && (
                  <div className={sectionBase}>
                    <div>
                      {fieldRow('商业模式描述')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="请描述您的业务如何运作，从获客到交付的关键环节"
                        value={form.businessModel ?? ''}
                        onChange={(e) => updateField('businessModel', e.target.value)}
                      />
                    </div>

                    <div>
                      {fieldRow('收入模式')}
                      <textarea
                        className={cn(textareaBase, 'h-20')}
                        placeholder="如何赚钱？SaaS订阅/交易佣金/广告/直销？预计毛利率？"
                        value={form.revenueModel ?? ''}
                        onChange={(e) => updateField('revenueModel', e.target.value)}
                      />
                    </div>

                    <div>
                      {fieldRow('核心竞争优势')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="技术壁垒/专利/网络效应/数据积累/团队优势/成本优势等"
                        value={form.competitiveAdvantage ?? ''}
                        onChange={(e) => updateField('competitiveAdvantage', e.target.value)}
                      />
                    </div>

                    <div>
                      {fieldRow('竞品分析')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="主要竞争对手有哪些？与他们相比您的差异化在哪里？"
                        value={form.competitorAnalysis ?? ''}
                        onChange={(e) => updateField('competitorAnalysis', e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {currentStep === 3 && (
                  <div className={sectionBase}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        {fieldRow('产品状态')}
                        <div className="grid grid-cols-2 gap-2">
                          {PRODUCT_STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => updateField('productStatus', opt.value)}
                              className={cn(
                                'h-11 rounded-xl border text-sm font-medium transition-all',
                                form.productStatus === opt.value
                                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      {fieldRow('用户指标数据')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="注册用户数/付费用户数/留存率/NPS/GMV等关键数据"
                        value={form.userMetrics ?? ''}
                        onChange={(e) => updateField('userMetrics', e.target.value)}
                      />
                    </div>

                    <div>
                      {fieldRow('业务进展')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="重要合作、客户签约、营收情况、里程碑达成等"
                        value={form.businessProgress ?? ''}
                        onChange={(e) => updateField('businessProgress', e.target.value)}
                      />
                    </div>

                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="w-4 h-4 text-indigo-500" />
                          <span className="text-sm font-semibold text-slate-700">项目里程碑</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={<Plus className="w-3.5 h-3.5" />}
                          onClick={addMilestone}
                          className="h-8"
                        >
                          添加里程碑
                        </Button>
                      </div>

                      {(!form.milestones || form.milestones.length === 0) && (
                        <div className="rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/30 p-6 text-center">
                          <p className="text-sm text-slate-500">还没有添加里程碑</p>
                          <p className="text-xs text-slate-400 mt-1">记录项目关键节点和未来规划</p>
                        </div>
                      )}

                      <div className="space-y-3">
                        {(form.milestones ?? []).map((m, idx) => (
                          <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-slate-200 bg-slate-50/30 p-4 relative"
                          >
                            <div className="flex items-start gap-3">
                              <button
                                onClick={() => updateMilestone(m.id, { completed: !m.completed })}
                                className="mt-0.5 flex-shrink-0 text-slate-400 hover:text-emerald-500 transition-colors"
                              >
                                {m.completed ? (
                                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                                ) : (
                                  <Square className="w-5 h-5" />
                                )}
                              </button>
                              <div className="flex-1 grid grid-cols-1 md:grid-cols-12 gap-3 min-w-0">
                                <div className="md:col-span-5">
                                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">里程碑名称</label>
                                  <input
                                    className={inputBase}
                                    placeholder={`里程碑 ${idx + 1}`}
                                    value={m.title}
                                    onChange={(e) => updateMilestone(m.id, { title: e.target.value })}
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">计划日期</label>
                                  <input
                                    type="date"
                                    className={inputBase}
                                    value={m.date}
                                    onChange={(e) => updateMilestone(m.id, { date: e.target.value })}
                                  />
                                </div>
                                <div className="md:col-span-3">
                                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">状态</label>
                                  <div className={cn('h-11 px-4 rounded-xl border flex items-center text-sm font-medium', m.completed ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700')}>
                                    {m.completed ? '✓ 已完成' : '○ 进行中/待完成'}
                                  </div>
                                </div>
                                <div className="md:col-span-1 flex items-end justify-end pb-1">
                                  <button
                                    onClick={() => removeMilestone(m.id)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <div className="md:col-span-12">
                                  <label className="text-[11px] font-semibold text-slate-500 mb-1 block">详细描述</label>
                                  <input
                                    className={inputBase}
                                    placeholder="对该里程碑的详细说明"
                                    value={m.description}
                                    onChange={(e) => updateMilestone(m.id, { description: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {currentStep === 4 && (
                  <div className={sectionBase}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        {fieldRow('融资金额（万元）')}
                        <div className="relative">
                          <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="number"
                            min={0}
                            className={cn(inputBase, 'pl-10')}
                            placeholder="请输入融资金额"
                            value={form.fundingRequested ?? ''}
                            onChange={(e) => updateField('fundingRequested', Number(e.target.value))}
                          />
                        </div>
                      </div>
                      <div>
                        {fieldRow('出让股权比例（%）')}
                        <input
                          type="number"
                          min={0}
                          max={100}
                          className={inputBase}
                          placeholder="如：10"
                          value={form.equityOffered ?? ''}
                          onChange={(e) => updateField('equityOffered', Number(e.target.value))}
                        />
                      </div>
                    </div>

                    <div>
                      {fieldRow('资金用途计划')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="请说明本轮融资的资金使用计划，建议按比例分拆：如研发40%、市场35%、运营25%"
                        value={form.fundUsage ?? ''}
                        onChange={(e) => updateField('fundUsage', e.target.value)}
                      />
                    </div>

                    <div>
                      {fieldRow('融资后里程碑')}
                      <textarea
                        className={cn(textareaBase, 'h-24')}
                        placeholder="获得本轮融资后，12个月内计划达成哪些关键目标？用户规模、营收、团队、产品等维度"
                        value={form.postFundingMilestones ?? ''}
                        onChange={(e) => updateField('postFundingMilestones', e.target.value)}
                      />
                    </div>

                    <div className="rounded-xl bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50/50 border border-indigo-100 p-5 mt-2">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-indigo-900">完成检查</h4>
                          <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">
                            您已完成所有步骤的填写。确认信息无误后，可以先保存草稿随时回来修改，或直接提交申请。
                            提交后我们将在 3-5 个工作日内安排评审。
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 pb-4"
        >
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              icon={<ChevronLeft className="w-4 h-4" />}
              className="h-11"
            >
              上一步
            </Button>
            {currentStep < STEPS.length - 1 && (
              <Button
                variant="primary"
                onClick={nextStep}
                className="h-11 gap-2"
              >
                下一步
                <ChevronRight className="w-4 h-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleSaveDraft}
              icon={<Save className="w-4 h-4" />}
              className="h-11"
            >
              保存草稿
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={isSubmitting}
              icon={<Send className="w-4 h-4" />}
              className="h-11 shadow-md shadow-indigo-200/50"
            >
              {currentStep < STEPS.length - 1 ? '跳过并提交申请' : '提交申请'}
            </Button>
          </div>
        </motion.div>
      </div>
    </PageContainer>
  );
}

import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PodiumRanking {
  rank: number;
  projectName: string;
  score: number;
  investorCount: number;
  interest?: boolean;
}

interface PodiumRankProps {
  rankings: PodiumRanking[];
  className?: string;
}

const PODIUM_COLORS: Record<number, { bg: string; border: string; text: string; glow: string }> = {
  1: {
    bg: 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500',
    border: 'border-amber-400',
    text: 'text-amber-900',
    glow: 'shadow-[0_0_40px_rgba(251,191,36,0.35)]',
  },
  2: {
    bg: 'bg-gradient-to-b from-slate-300 via-slate-400 to-slate-500',
    border: 'border-slate-400',
    text: 'text-slate-900',
    glow: 'shadow-[0_0_30px_rgba(148,163,184,0.25)]',
  },
  3: {
    bg: 'bg-gradient-to-b from-orange-400 via-orange-500 to-orange-600',
    border: 'border-orange-400',
    text: 'text-orange-900',
    glow: 'shadow-[0_0_30px_rgba(217,119,6,0.25)]',
  },
};

const PODIUM_HEIGHTS: Record<number, string> = {
  1: 'h-40',
  2: 'h-28',
  3: 'h-20',
};

function PodiumRank({ rankings, className }: PodiumRankProps) {
  const top3 = [1, 2, 3].map((r) => rankings.find((p) => p.rank === r));

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-7 w-7 text-amber-600" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-slate-500" />;
    if (rank === 3) return <Trophy className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const podiumOrder = [2, 1, 3];

  return (
    <div className={cn('flex items-end justify-center gap-4 sm:gap-8 py-8', className)}>
      {podiumOrder.map((rank, idx) => {
        const data = top3[idx];
        const colors = PODIUM_COLORS[rank];
        const isChampion = rank === 1;

        return (
          <motion.div
            key={rank}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * rank, type: 'spring', stiffness: 180, damping: 18 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={data ? { y: [0, -4, 0] } : {}}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 0.2 * rank,
              }}
              className={cn(
                'flex flex-col items-center mb-3',
                isChampion && 'mb-4',
              )}
            >
              <div className="mb-1">{getRankIcon(rank)}</div>

              {isChampion && (
                <div className="relative">
                  <div className="absolute -inset-4 rounded-full bg-amber-300/20 blur-xl" />
                  <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 border-2 border-amber-300 shadow-lg">
                    <span className="font-display text-3xl font-bold text-amber-700">
                      {rank}
                    </span>
                  </div>
                </div>
              )}

              {!isChampion && data && (
                <div
                  className={cn(
                    'flex items-center justify-center rounded-xl border-2 bg-white/80 backdrop-blur-sm shadow-md',
                    isChampion ? 'h-14 w-14' : 'h-12 w-12',
                    colors.border,
                  )}
                >
                  <span
                    className={cn('font-display text-2xl font-bold', colors.text)}
                  >
                    {rank}
                  </span>
                </div>
              )}

              {data && (
                <div className="mt-2 text-center min-w-[120px]">
                  <p
                    className={cn(
                      'font-semibold leading-tight truncate',
                      isChampion ? 'text-lg text-slate-900' : 'text-sm text-slate-800',
                    )}
                  >
                    {data.projectName}
                  </p>
                  <div className="mt-1 flex items-center justify-center gap-1">
                    <span
                      className={cn(
                        'font-display font-bold',
                        isChampion ? 'text-2xl' : 'text-lg',
                        rank === 1 ? 'text-amber-600' : rank === 2 ? 'text-slate-600' : 'text-orange-600',
                      )}
                    >
                      {data.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-400">分</span>
                  </div>
                  <div className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
                    <Users className="h-3 w-3" />
                    <span>{data.investorCount} 投资人</span>
                  </div>
                </div>
              )}

              {!data && (
                <div className="mt-2 text-center min-w-[120px] text-slate-400 text-sm">
                  暂无数据
                </div>
              )}
            </motion.div>

            <div
              className={cn(
                'relative w-28 sm:w-36 rounded-t-2xl border-2 border-b-0 overflow-hidden',
                colors.border,
                colors.bg,
                colors.glow,
                PODIUM_HEIGHTS[rank],
              )}
            >
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.25)_0%,transparent_50%,rgba(0,0,0,0.08)_100%)]" />
              <div className="absolute inset-x-0 top-2 h-1 mx-3 rounded-full bg-white/40" />
              <div className="absolute bottom-3 left-0 right-0 text-center">
                <span className="text-[10px] uppercase tracking-wider text-white/80 font-semibold">
                  {rank === 1 ? 'CHAMPION' : rank === 2 ? 'RUNNER-UP' : 'THIRD'}
                </span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default PodiumRank;

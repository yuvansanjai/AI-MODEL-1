import React from 'react';
import { MOCK_TEEN_CHALLENGES } from '../../services/mockData';
import { useApp } from '../../contexts/AppContext';
import { CheckCircle2, Circle, Zap, Target, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export const TeenagerChallenge: React.FC = () => {
  const { userStats, completeChallenge } = useApp();

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-teal-500/30 p-6 shadow-xl backdrop-blur-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
            <Target size={18} />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <span>Daily Protocol & Challenges</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-mono">
                Active
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-mono">
              Apply timeless principles into daily execution
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-mono text-slate-400 block">Total XP</span>
          <span className="text-sm font-bold font-mono text-amber-400">
            +{userStats.xpPoints} XP
          </span>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-3.5">
        {MOCK_TEEN_CHALLENGES.map((challenge) => {
          const isDone = userStats.completedChallenges.includes(challenge.id);

          return (
            <motion.div
              key={challenge.id}
              whileHover={{ scale: 1.01 }}
              className={`p-4 rounded-xl border transition-all ${
                isDone
                  ? 'bg-teal-950/30 border-teal-500/40 opacity-90'
                  : 'bg-slate-800/60 border-slate-700 hover:border-teal-500/40'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-slate-700 text-teal-300 font-bold">
                      {challenge.category}
                    </span>
                    <span className="text-xs font-mono text-amber-400 flex items-center gap-1 font-bold">
                      <Zap size={13} />
                      +{challenge.xpPoints} XP
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-white mb-1">
                    {challenge.titleTamil} — {challenge.titleEnglish}
                  </h4>
                  <p className="text-xs text-slate-300 mb-2">
                    {challenge.descriptionEnglish}
                  </p>

                  <div className="p-2.5 rounded-lg bg-black/30 border border-slate-800 text-xs font-mono text-teal-200">
                    <span className="text-slate-400">Action: </span>
                    {challenge.actionItem}
                  </div>
                </div>

                <button
                  type="button"
                  disabled={isDone}
                  onClick={() => completeChallenge(challenge.id, challenge.xpPoints)}
                  className={`shrink-0 p-2 rounded-xl transition-all ${
                    isDone
                      ? 'text-teal-400 bg-teal-500/20 cursor-default'
                      : 'text-slate-400 hover:text-teal-300 hover:bg-slate-700'
                  }`}
                  title={isDone ? 'Challenge completed!' : 'Mark as completed'}
                >
                  {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

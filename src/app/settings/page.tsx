'use client';

import { useState } from 'react';
import { Settings, Shield, Zap, Bell, Volume2, Globe, Palette } from 'lucide-react';
import ToggleSwitch from '@/components/ToggleSwitch';

export default function SettingsPage() {
  const [kidMode, setKidMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoNext, setAutoNext] = useState(false);
  const [showProgress, setShowProgress] = useState(true);

  const sections = [
    {
      title: 'Study Experience',
      icon: Zap,
      options: [
        { id: 'kid-mode', label: 'Master Mascot Mode', desc: 'Enable subject-aware chibi characters and gamified feedback.', val: kidMode, set: setKidMode },
        { id: 'auto-next', label: 'Auto-Advance Cards', desc: 'Automatically move to the next card after rating.', val: autoNext, set: setAutoNext },
        { id: 'show-prog', label: 'Session Progress Bar', desc: 'Show visual progress at the top of study sessions.', val: showProgress, set: setShowProgress },
      ]
    },
    {
      title: 'System & Feedback',
      icon: Bell,
      options: [
        { id: 'sounds', label: 'Sparkle Sound Effects', desc: 'Enable tactile audio feedback on card flips.', val: soundEffects, set: setSoundEffects },
      ]
    }
  ];

  return (
    <div className="min-h-screen py-10 px-6 max-w-4xl mx-auto space-y-12">
      
      {/* ⚙️ HEADER SECTION */}
      <div className="space-y-2">
        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400 uppercase tracking-widest leading-none">
          System Preferences
        </span>
        <h1 className="text-4xl font-black text-white tracking-tight">Configuration</h1>
        <p className="text-gray-500 text-sm font-medium tracking-wide">
          Customize your study environment and AI forge settings.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {sections.map((section) => (
          <div key={section.title} className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-purple-600/10 text-purple-400">
                <section.icon className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">{section.title}</h2>
            </div>

            <div className="space-y-4">
              {section.options.map((opt) => (
                <div 
                  key={opt.id}
                  className="flex items-center justify-between p-6 rounded-[20px] bg-[#0f0a1e] border border-white/5 shadow-xl hover:border-purple-500/20 transition-all"
                >
                  <div className="space-y-1 pr-10">
                    <p className="text-[13px] font-black text-white uppercase tracking-wider">{opt.label}</p>
                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                      {opt.desc}
                    </p>
                  </div>
                  <ToggleSwitch enabled={opt.val} onChange={opt.set} />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* IDENTITY SECTION */}
        <div className="space-y-6 border-t border-white/5 pt-12">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-pink-600/10 text-pink-400">
              <Shield className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-white uppercase tracking-tight">Identity & Storage</h2>
          </div>

          <div className="bg-[#0f0a1e] border border-white/5 p-8 rounded-[24px] shadow-2xl flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center border-4 border-[#1a1040]">
              <span className="text-3xl font-black text-white">S</span>
            </div>
            <div className="flex-1 text-center md:text-left space-y-1">
              <h3 className="text-2xl font-black text-white">Master Forge User</h3>
              <p className="text-[10px] font-black text-purple-400 uppercase tracking-[0.2em]">Level 7 Pioneer · 1,240 XP Earned</p>
            </div>
            <div className="px-6 py-2 rounded-full border border-pink-500/30 text-pink-500 text-[10px] font-black uppercase tracking-widest bg-pink-500/5">
              Local Storage Active
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

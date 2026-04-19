'use client';

import { useState, useEffect } from 'react';
import { Settings, Shield, Zap, Bell, AlertTriangle } from 'lucide-react';
import ToggleSwitch from '@/components/ToggleSwitch';

export default function SettingsPage() {
  const [kidMode, setKidMode] = useState(true);
  const [soundEffects, setSoundEffects] = useState(true);
  const [autoNext, setAutoNext] = useState(false);
  const [showProgress, setShowProgress] = useState(true);



  // Notifications
  const [dailyReminder, setDailyReminder] = useState(true);
  const [reminderTime, setReminderTime] = useState('19:00');
  const [streakWarning, setStreakWarning] = useState(true);



  const handleClearData = () => {
    if (confirm('Are you absolutely sure? This will wipe all decks, flashcards, and sessions. This cannot be undone.')) {
      localStorage.removeItem('flashforge-storage');
      window.location.reload();
    }
  };

  const handleResetXP = () => {
    if (confirm('Are you sure you want to reset your XP and Level back to 1?')) {
      const storage = localStorage.getItem('flashforge-storage');
      if (storage) {
        const data = JSON.parse(storage);
        data.state.xp = 0;
        localStorage.setItem('flashforge-storage', JSON.stringify(data));
        window.location.reload();
      }
    }
  };

  const handleExportData = () => {
    if (confirm('Export all your study data to a JSON file?')) {
      const storage = localStorage.getItem('flashforge-storage');
      if (storage) {
        const blob = new Blob([storage], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `flashforge-export-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
      }
    }
  };

  const sections = [

    {
      title: 'Study Experience',
      icon: Settings,
      content: (
        <div className="space-y-4">
          {[
            { id: 'kid-mode', label: 'Master Mascot Mode', desc: 'Enable subject-aware chibi characters and gamified feedback.', val: kidMode, set: setKidMode },
            { id: 'auto-next', label: 'Auto-Advance Cards', desc: 'Automatically move to the next card after rating.', val: autoNext, set: setAutoNext },
            { id: 'show-prog', label: 'Session Progress Bar', desc: 'Show visual progress at the top of study sessions.', val: showProgress, set: setShowProgress },
            { id: 'sounds', label: 'Sparkle Sound Effects', desc: 'Enable tactile audio feedback on card flips.', val: soundEffects, set: setSoundEffects },
          ].map((opt) => (
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
      )
    },
    {
      title: 'Notifications',
      icon: Bell,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between p-6 rounded-[20px] bg-[#0f0a1e] border border-white/5 shadow-xl transition-all">
            <div className="space-y-1 pr-10 flex-1">
              <p className="text-[13px] font-black text-white uppercase tracking-wider">Daily Reminder</p>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Remind you to forge and study.
              </p>
            </div>
            <div className="flex items-center gap-4">
              {dailyReminder && (
                <input 
                  type="time" 
                  value={reminderTime}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="bg-[#1a1040] border border-white/10 rounded-xl px-3 py-1.5 text-white font-medium focus:outline-none"
                />
              )}
              <ToggleSwitch enabled={dailyReminder} onChange={setDailyReminder} />
            </div>
          </div>
          
          <div className="flex items-center justify-between p-6 rounded-[20px] bg-[#0f0a1e] border border-white/5 shadow-xl transition-all">
            <div className="space-y-1 pr-10">
              <p className="text-[13px] font-black text-white uppercase tracking-wider">Streak At Risk Warning</p>
              <p className="text-[11px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed">
                Alert me if my streak is about to be lost.
              </p>
            </div>
            <ToggleSwitch enabled={streakWarning} onChange={setStreakWarning} />
          </div>
        </div>
      )
    },
    {
      title: 'Danger Zone',
      icon: AlertTriangle,
      content: (
        <div className="p-6 rounded-[20px] bg-[#2a0e14] border border-red-500/20 shadow-xl space-y-4">
          <p className="text-[11px] text-red-400/80 font-bold uppercase tracking-widest leading-relaxed mb-6">
            These actions are irreversible. Please proceed with caution.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleExportData}
              className="w-full text-left px-6 py-4 rounded-xl border border-red-500/30 text-red-400 font-black text-[13px] uppercase tracking-wider hover:bg-red-500/10 transition-colors"
            >
              Export My Data
            </button>
            <button
              onClick={handleResetXP}
              className="w-full text-left px-6 py-4 rounded-xl border border-red-500/30 text-red-500 font-black text-[13px] uppercase tracking-wider hover:bg-red-600/10 transition-colors"
            >
              Reset XP and Level
            </button>
            <button
              onClick={handleClearData}
              className="w-full text-left px-6 py-4 rounded-xl border border-red-500/50 text-red-500 font-black text-[13px] uppercase tracking-wider hover:bg-red-600/20 transition-colors bg-red-500/5"
            >
              Clear All Study Data
            </button>
          </div>
        </div>
      )
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
              <div className={`p-2 rounded-xl text-white ${section.title === 'Danger Zone' ? 'bg-red-600/10 text-red-500' : 'bg-purple-600/10 text-purple-400'}`}>
                <section.icon className="w-5 h-5" />
              </div>
              <h2 className={`text-xl font-black uppercase tracking-tight ${section.title === 'Danger Zone' ? 'text-red-500' : 'text-white'}`}>
                {section.title}
              </h2>
            </div>
            {section.content}
          </div>
        ))}
      </div>

    </div>
  );
}

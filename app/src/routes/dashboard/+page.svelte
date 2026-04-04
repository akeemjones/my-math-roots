<script lang="ts">
  /**
   * /dashboard — Full parent dashboard.
   *
   * Direct line-by-line port of dashboard/dashboard.js.
   * Section order matches renderDashboard() exactly:
   *   Manage Profiles · Weekly Snapshot · Root System · Overview ·
   *   Time · Recent Quizzes · Skills · Weak Areas · Practice Spotlight ·
   *   Review Queue · Activity · AI Report · Access Controls ·
   *   Timer · Accessibility · Change PIN · Reminders · Password ·
   *   Feedback · Changelog
   */

  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { scores, mastery, streak, appTime, done, actDates, unitsData, activeStudentId, activeStudent, familyProfiles, aiReports, hasPassed } from '$lib/stores';
  import { supabase } from '$lib/supabase';
  import { getStudentProfiles } from '$lib/services/auth';
  import { DEFAULT_STREAK, DEFAULT_APP_TIME } from '$lib/types';
  import type { ScoreEntry, QuizAnswer } from '$lib/types';
  import {
    ICON_PERSON, ICON_KEY, ICON_CALENDAR, ICON_TIMER, ICON_FLAME, ICON_BOOK,
    ICON_CLIPBOARD, ICON_WARNING, ICON_MEMO, ICON_CYCLE, ICON_CALDAY, ICON_ALARM,
    ICON_UNLOCK, ICON_STAR, ICON_LOCK, ICON_TRASH, ICON_A11Y, ICON_BELL,
    ICON_CHAT, ICON_ROBOT, ICON_TREE, ICON_SPROUT, ICON_ROCK,
    ICON_CHECK_CIRCLE, ICON_CROSS_CIRCLE, ICON_REFRESH, AVATAR_SVG,
  } from '$lib/icons/dashboard';

  // ── Constants ─────────────────────────────────────────────────────────────

  const UNIT_NAMES = [
    'Basic Fact Strategies','Place Value','Add & Subtract to 200',
    'Add & Subtract to 1,000','Money & Financial Literacy','Data Analysis',
    'Measurement & Time','Fractions','Geometry','Multiplication & Division',
  ];

  const UNITS_META = [
    { name: 'Basic Fact Strategies',      lessons: ['Count Up & Count Back','Doubles!','Make a 10','Number Families'] },
    { name: 'Place Value',                lessons: ['Big Numbers','Different Ways to Write Numbers','Bigger or Smaller?','Skip Counting'] },
    { name: 'Add & Subtract to 200',      lessons: ['Adding Bigger Numbers','Taking Away Bigger Numbers','Add Three Numbers','Math Stories'] },
    { name: 'Add & Subtract to 1,000',    lessons: ['Adding Really Big Numbers','Taking Away Really Big Numbers','Close Enough Counts!'] },
    { name: 'Money & Financial Literacy', lessons: ['All About Coins','Count Your Coins','Dollars and Cents','Save, Spend and Give'] },
    { name: 'Data Analysis',              lessons: ['Tally Marks','Bar Graphs','Picture Graphs','Line Plots'] },
    { name: 'Measurement & Time',         lessons: ['How Long Is It?','What Time Is It?','Hot, Cold and Full'] },
    { name: 'Fractions',                  lessons: ['What is a Fraction?','Halves, Fourths and Eighths','Which Piece is Bigger?'] },
    { name: 'Geometry',                   lessons: ['Flat Shapes','Solid Shapes','Mirror Shapes'] },
    { name: 'Multiplication & Division',  lessons: ['Equal Groups','Adding the Same Number','Sharing Equally'] },
  ];

  const COLORS = ['#6c5ce7','#0984e3','#00b894','#e17055','#fdcb6e','#a29bfe','#fd79a8','#55efc4','#74b9ff','#fab1a0'];
  const DAY_ABBR = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

  // ── Helpers ───────────────────────────────────────────────────────────────

  function parseSecs(t: string | number | undefined): number {
    if (!t) return 0;
    const p = String(t).split(':');
    return (parseInt(p[0]) || 0) * 60 + (parseInt(p[1]) || 0);
  }

  function fmtSecs(s: number): string {
    if (!s) return '—';
    const m = Math.floor(s / 60), sec = Math.round(s % 60);
    return m + 'm ' + String(sec).padStart(2, '0') + 's';
  }

  function dbTimerLbl(s: number): string {
    if (s < 60) return s + ' sec';
    const m = Math.floor(s / 60), r = s % 60;
    return r ? m + 'm ' + r + 's' : m + (m === 1 ? ' min' : ' mins');
  }

  function validColor(val: string | undefined): string {
    if (typeof val !== 'string') return '#f59e0b';
    const v = val.trim();
    return /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(v) ? v : '#f59e0b';
  }

  function quizAvgQSecs(s: ScoreEntry): number {
    if (!s.answers) return 0;
    let sum = 0, n = 0;
    s.answers.forEach(a => { if (a.timeSecs != null && a.timeSecs < 300) { sum += a.timeSecs; n++; } });
    return n > 0 ? Math.round(sum / n) : 0;
  }

  function pctColor(pct: number): string {
    return pct >= 80 ? '#2e7d32' : pct >= 60 ? '#e65100' : '#c62828';
  }

  function typeLabel(type: string): string {
    const m: Record<string, string> = { lesson: 'Lesson Quiz', unit: 'Unit Test', final: 'Final Test', practice: 'Practice' };
    return m[type] || type;
  }

  // ── Computed data ─────────────────────────────────────────────────────────

  // Per-student scores loaded from Supabase (overrides local store when available)
  let studentScores = $state<ScoreEntry[]>([]);
  let scoresLoading = $state(false);

  // Completed quizzes (non-null pct, non-zero total, non-practice)
  const completed = $derived(
    studentScores.filter(s => s.pct != null && s.total > 0 && s.type && s.type !== 'practice')
  );

  // ── Weekly Snapshot ──────────────────────────────────────────────────────
  const weeklySnapshot = $derived.by(() => {
    const at = $appTime;
    let weekSecs = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      weekSecs += (at.dailySecs[d] || 0);
    }
    const weekMins = Math.round(weekSecs / 60);
    const timeStr = weekMins >= 60
      ? Math.floor(weekMins / 60) + 'h ' + String(weekMins % 60).padStart(2, '0') + 'm'
      : weekMins + 'm';
    const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
    const weekLessons = studentScores.filter(s =>
      s.type === 'lesson' && s.pct != null && s.total > 0 && s.date && s.date >= cutoff
    ).length;
    const cur = ($streak?.current) || 0;
    return { weekMins, timeStr, weekLessons, cur };
  });

  // ── Root System ──────────────────────────────────────────────────────────
  const rootNodes = $derived.by(() => {
    const unitMap: Record<number, { sumPct: number; count: number; best: number }> = {};
    completed.forEach(s => {
      if (s.unitIdx == null) return;
      const k = s.unitIdx;
      if (!unitMap[k]) unitMap[k] = { sumPct: 0, count: 0, best: 0 };
      unitMap[k].sumPct += s.pct;
      unitMap[k].count++;
      if (s.pct > unitMap[k].best) unitMap[k].best = s.pct;
    });
    return UNIT_NAMES.map((name, idx) => {
      const data = unitMap[idx];
      if (!data) return { name, idx, state: 'locked' as const, avg: 0 };
      const avg = Math.round(data.sumPct / data.count);
      const state = avg >= 80 ? 'mastered' as const : avg >= 60 ? 'growing' as const : 'struggling' as const;
      return { name, idx, state, avg };
    });
  });

  const rootSummary = $derived({
    mastered: rootNodes.filter(n => n.state === 'mastered').length,
    touched:  rootNodes.filter(n => n.state !== 'locked').length,
  });

  const stateColor: Record<string, string> = {
    mastered: '#2e7d32', growing: '#f57f17', struggling: '#c62828', locked: '#cfd8dc',
  };
  const stateLabel: Record<string, string> = {
    mastered: 'Mastered', growing: 'In Progress', struggling: 'Needs Work', locked: 'Not Started',
  };
  const stateIcon: Record<string, string> = {
    mastered: ICON_TREE, growing: ICON_SPROUT,
    struggling: `<svg width="15" height="15" viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle"><g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/></g><path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="#28a855" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="#f5a020"/><path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="#ee9010"/><path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="#5ad880"/></svg>`,
    locked: ICON_ROCK,
  };

  const SPROUT_SVG = `<svg width="22" height="22" viewBox="0 0 310 300" fill="none" xmlns="http://www.w3.org/2000/svg" style="vertical-align:middle;margin-right:6px;filter:drop-shadow(0 1px 3px rgba(0,80,20,0.18))"><defs><linearGradient id="rs-l1" x1="5%" y1="5%" x2="95%" y2="95%"><stop offset="0%" stop-color="#ffd8a0"/><stop offset="38%" stop-color="#f5a020"/><stop offset="100%" stop-color="#c86c00"/></linearGradient><linearGradient id="rs-l2" x1="95%" y1="5%" x2="5%" y2="95%"><stop offset="0%" stop-color="#ffe4b0"/><stop offset="38%" stop-color="#ee9010"/><stop offset="100%" stop-color="#b85e00"/></linearGradient><linearGradient id="rs-ls" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#3ada6e"/><stop offset="100%" stop-color="#14762e"/></linearGradient><linearGradient id="rs-lb" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#aeffc8"/><stop offset="100%" stop-color="#28c45c"/></linearGradient></defs><g stroke-linecap="round" fill="none"><path d="M154 284 Q100 278 72 292" stroke="#16763a" stroke-width="3.0"/><path d="M156 284 Q210 278 238 292" stroke="#16763a" stroke-width="3.0"/><path d="M154 283 Q112 270 92 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M156 283 Q198 270 218 278" stroke="#1a8e44" stroke-width="3.2"/><path d="M154 283 Q128 266 116 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M156 283 Q182 266 194 268" stroke="#1e9e4c" stroke-width="3.4"/><path d="M154 282 Q142 266 138 260" stroke="#20a650" stroke-width="3.5"/><path d="M156 282 Q168 266 172 260" stroke="#20a650" stroke-width="3.5"/></g><path d="M155 278 Q152 234 154 190 Q156 155 155 118" stroke="url(#rs-ls)" stroke-width="5.5" stroke-linecap="round" fill="none"/><path d="M154 194 C136 174,82 152,62 108 C50 78,74 50,104 70 C126 85,144 146,154 194Z" fill="url(#rs-l1)"/><path d="M156 162 C176 142,228 120,248 76 C260 46,236 18,206 38 C184 54,164 112,156 162Z" fill="url(#rs-l2)"/><path d="M155 118 C147 100 145 74 155 56 C165 74 163 100 155 118Z" fill="url(#rs-lb)"/></svg>`;

  // ── Overview stats ────────────────────────────────────────────────────────
  const overallStats = $derived.by(() => {
    const at = $appTime;
    let weekSecs = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      weekSecs += (at.dailySecs[d] || 0);
    }
    let sumPct = 0, totalCorrect = 0, totalAttempted = 0;
    completed.forEach(s => { sumPct += s.pct; totalCorrect += s.score; totalAttempted += s.total; });
    const accuracy = completed.length > 0 ? Math.round(sumPct / completed.length) : 0;
    const lastActive = completed.length > 0 ? completed[0].date : null;
    return { accuracy, quizCount: completed.length, totalCorrect, totalAttempted, weekSecs, lastActive, streak: $streak?.current || 0 };
  });

  // ── Time breakdown ────────────────────────────────────────────────────────
  const timeBreakdown = $derived.by(() => {
    const at = $appTime;
    const withTime = completed.filter(s => s.timeTaken && parseSecs(s.timeTaken) > 0);
    let weekSecs = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
      weekSecs += (at.dailySecs[d] || 0);
    }
    const avgSession = at.sessions > 0 ? Math.round(at.totalSecs / at.sessions) : 0;
    const typeMap: Record<string, { sum: number; n: number }> = {};
    withTime.forEach(s => {
      const tp = s.type || 'lesson';
      if (!typeMap[tp]) typeMap[tp] = { sum: 0, n: 0 };
      typeMap[tp].sum += parseSecs(s.timeTaken);
      typeMap[tp].n++;
    });
    let qSum = 0, qCount = 0;
    completed.forEach(s => {
      s.answers?.forEach(a => { if (a.timeSecs != null && a.timeSecs < 300) { qSum += a.timeSecs; qCount++; } });
    });
    const avgQ = qCount > 0 ? Math.round(qSum / qCount) : 0;
    const avgType = (tp: string) => typeMap[tp]?.n ? Math.round(typeMap[tp].sum / typeMap[tp].n) : 0;
    const hasAny = at.totalSecs > 0 || withTime.length > 0;
    return { hasAny, weekSecs, totalSecs: at.totalSecs, avgSession, avgLesson: avgType('lesson'), avgUnit: avgType('unit'), avgFinal: avgType('final'), avgQ, withTime: withTime.length };
  });

  // ── Recent quizzes ────────────────────────────────────────────────────────
  const recentQuizzes = $derived(completed.slice(0, 10));

  // ── Skills by unit ────────────────────────────────────────────────────────
  const skillBreakdown = $derived.by(() => {
    const map: Record<number, { sumPct: number; correct: number; total: number; count: number }> = {};
    completed.forEach(s => {
      if (s.unitIdx == null) return;
      const k = s.unitIdx;
      if (!map[k]) map[k] = { sumPct: 0, correct: 0, total: 0, count: 0 };
      map[k].sumPct  += s.pct;
      map[k].correct += s.score;
      map[k].total   += s.total;
      map[k].count++;
    });
    return Object.keys(map)
      .map(k => {
        const idx = parseInt(k, 10);
        const v = map[idx];
        return { unitIdx: idx, label: UNIT_NAMES[idx] || ('Unit ' + (idx + 1)), accuracy: Math.round(v.sumPct / v.count), correct: v.correct, total: v.total };
      })
      .sort((a, b) => a.unitIdx - b.unitIdx);
  });

  // ── Weak areas ────────────────────────────────────────────────────────────
  const weakAreas = $derived(
    skillBreakdown.filter(s => s.total >= 5 && s.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)
  );

  // ── Practice spotlight ────────────────────────────────────────────────────
  const practiceSpotlight = $derived.by(() => {
    const m = $mastery as Record<string, { attempts: number; correct: number }>;
    return Object.keys(m)
      .map(k => ({ k, m: m[k] }))
      .filter(e => e.m.attempts >= 2 && (e.m.correct / e.m.attempts) < 0.6)
      .sort((a, b) => (a.m.correct / a.m.attempts) - (b.m.correct / b.m.attempts))
      .slice(0, 5)
      .map(e => ({
        key: e.k,
        acc: Math.round((e.m.correct / e.m.attempts) * 100),
        attempts: e.m.attempts,
      }));
  });

  // ── Review queue ──────────────────────────────────────────────────────────
  const reviewQueue = $derived.by(() => {
    const now = Date.now();
    const m = $mastery as Record<string, { attempts?: number; correct?: number; nextReview?: number }>;
    const result = Object.keys(m)
      .map(k => {
        const mv = m[k];
        if (mv.nextReview == null) return null;
        return {
          key: k,
          accuracy: mv.attempts && mv.attempts > 0 ? Math.round((mv.correct || 0) / mv.attempts * 100) : 0,
          overdue: mv.nextReview <= now,
          nextReview: mv.nextReview,
        };
      })
      .filter(Boolean) as { key: string; accuracy: number; overdue: boolean; nextReview: number }[];
    result.sort((a, b) => {
      if (a.overdue !== b.overdue) return a.overdue ? -1 : 1;
      return a.nextReview - b.nextReview;
    });
    return result;
  });

  // ── Activity (last 7 days) ────────────────────────────────────────────────
  const activityData = $derived.by(() => {
    const countMap: Record<string, number> = {};
    studentScores.forEach(s => {
      if (s.pct != null && s.total > 0 && s.date) countMap[s.date] = (countMap[s.date] || 0) + 1;
    });
    const result = [];
    for (let i = 0; i < 7; i++) {
      const ts  = Date.now() - i * 86400000;
      const d   = new Date(ts).toISOString().slice(0, 10);
      const dow = new Date(ts).getUTCDay();
      result.push({ date: d, dayLabel: DAY_ABBR[dow], quizCount: countMap[d] || 0 });
    }
    return result;
  });

  const activityMax = $derived(Math.max(...activityData.map(d => d.quizCount), 1));

  // ── AI report ─────────────────────────────────────────────────────────────
  const studentId = $derived($activeStudentId ?? '');
  const aiReport  = $derived($aiReports[studentId] ?? null);
  const COOLDOWN_DAYS = 14;
  const daysSinceReport = $derived.by(() => {
    if (!aiReport?.lastDate) return Infinity;
    return Math.floor((Date.now() - new Date(aiReport.lastDate).getTime()) / 86400000);
  });
  const canGenerateReport = $derived(!aiReport || daysSinceReport >= COOLDOWN_DAYS);
  const nextReportDate = $derived.by(() => {
    if (!aiReport?.lastDate) return '';
    return new Date(new Date(aiReport.lastDate).getTime() + COOLDOWN_DAYS * 86400000)
      .toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  });

  let aiLoading      = $state(false);
  let aiError        = $state('');
  let reportView     = $state(false);
  let reportSections = $state<{ hdr: string; bod: string; col: string }[]>([]);

  const AI_COLOURS = ['#1565C0','#2e7d32','#e65100','#673ab7','#00838f','#b71c1c'];

  function parseReportSections(text: string) {
    const parts = text.split(/^## /m).filter(Boolean);
    return parts.map((part, idx) => {
      const nl = part.indexOf('\n');
      return {
        hdr: nl > -1 ? part.slice(0, nl).trim() : part.trim(),
        bod: nl > -1 ? part.slice(nl + 1).trim() : '',
        col: AI_COLOURS[idx % AI_COLOURS.length],
      };
    });
  }

  async function generateReport() {
    if (!studentId || aiLoading) return;
    aiLoading = true; aiError = ''; reportView = true; reportSections = [];
    try {
      await new Promise(r => setTimeout(r, 1500));
      const allScores = studentScores;
      const totalQs  = allScores.reduce((s, e) => s + e.total, 0);
      const correct  = allScores.reduce((s, e) => s + e.score, 0);
      const pct      = totalQs > 0 ? Math.round((correct / totalQs) * 100) : 0;
      const cur      = $streak?.current || 0;
      const text = [
        `## Summary`,
        `Overall Accuracy: ${pct}% across ${allScores.length} quiz${allScores.length !== 1 ? 'zes' : ''}.`,
        `Current streak: ${cur} day${cur !== 1 ? 's' : ''}.`,
        '',
        `## Recommendation`,
        pct >= 80 ? 'Excellent work! Strong mastery. Keep up the consistent practice.'
        : pct >= 60 ? 'Good progress! Focus on amber lessons in the Mastery Map.'
        : 'Getting started. Regular 10–15 min practice sessions build foundational habits.',
        '',
        `## Note`,
        'Connect the Gemini API for real personalised insights.',
      ].join('\n');
      reportSections = parseReportSections(text);
      aiReports.update(r => ({ ...r, [studentId]: { lastDate: new Date().toISOString().slice(0,10), text } }));
    } catch {
      aiError = 'Failed to generate report. Please try again.';
      reportView = false;
    }
    finally { aiLoading = false; }
  }

  function backToStats() {
    reportView = false;
  }

  function downloadReportPDF() {
    if (!aiReport?.text) return;
    const blob = new Blob([aiReport.text], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = 'ai-report.txt'; a.click();
    URL.revokeObjectURL(url);
  }

  // Restore sections from stored report when returning to a cached report
  $effect(() => {
    if (reportView && !aiLoading && reportSections.length === 0 && aiReport?.text) {
      reportSections = parseReportSections(aiReport.text);
    }
  });

  async function loadStudentScores(sid: string) {
    if (!sid) { studentScores = []; return; }
    scoresLoading = true;
    try {
      const { data, error } = await supabase
        .from('quiz_scores')
        .select('local_id,qid,label,type,score,total,pct,stars,unit_idx,color,student_name,time_taken,answers,date_str,time_str,quit,abandoned,student_id')
        .eq('student_id', sid)
        .order('local_id', { ascending: false })
        .limit(300);
      if (error) throw error;
      studentScores = (data ?? []).map((r) => ({
        id:        r.local_id,
        qid:       r.qid,
        label:     r.label,
        type:      r.type as any,
        unitIdx:   r.unit_idx,
        color:     r.color ?? '',
        score:     r.score,
        total:     r.total,
        pct:       r.pct,
        stars:     r.stars,
        date:      r.date_str ?? '',
        time:      r.time_str ?? '',
        timeTaken: r.time_taken ?? '',
        answers:   r.answers ?? [],
        name:      r.student_name ?? '',
        studentId: r.student_id ?? sid,
        quit:      r.quit ?? undefined,
        abandoned: r.abandoned ?? undefined,
      }));
    } catch {
      // Fall back to local store filtered by studentId
      studentScores = $scores.filter(s => !s.studentId || s.studentId === sid);
    } finally {
      scoresLoading = false;
    }
  }

  async function loadStudentProfile(sid: string) {
    if (!sid) return;
    try {
      const { data, error } = await supabase
        .from('student_profiles')
        .select('mastery_json, streak_current, streak_longest, streak_last_date, apptime_json')
        .eq('id', sid)
        .single();
      if (error || !data) return;
      // Populate stores with this student's server-side data
      if (data.mastery_json && Object.keys(data.mastery_json).length > 0) {
        mastery.set(data.mastery_json);
      }
      const sc = data.streak_current ?? 0;
      const sl = data.streak_longest  ?? 0;
      const ld = data.streak_last_date ?? '';
      if (sc > 0 || sl > 0 || ld) {
        streak.set({ current: sc, longest: sl, lastDate: ld || null });
      }
      if (data.apptime_json && (data.apptime_json.totalSecs || 0) > 0) {
        appTime.set(data.apptime_json);
      }
    } catch { /* silently ignore — stores keep their local values */ }
  }

  $effect(() => {
    const sid = $activeStudentId;
    if (sid) {
      loadStudentScores(sid);
      loadStudentProfile(sid);
    } else {
      studentScores = [];
    }
  });

  // ── Access Controls state ─────────────────────────────────────────────────

  let unlockDraft     = $state({ freeMode: false, units: [] as number[], lessons: {} as Record<string, boolean> });
  let unlockDirty     = $state(false);
  let activeDrawerUnit= $state(-1);
  let unlockMsg       = $state('');
  let unlockMsgErr    = $state(false);
  let savingUnlock    = $state(false);

  function isUnitUnlocked(unitIdx: number): boolean {
    if (unitIdx === 0) return true; // Unit 1 is always unlocked
    if (unlockDraft.freeMode) return true;
    if (unlockDraft.units.includes(unitIdx)) return true;
    // Also unlocked if previous unit quiz was passed
    const prevUnit = $unitsData[unitIdx - 1];
    if (prevUnit && $hasPassed(prevUnit.id + '_uq')) return true;
    return false;
  }
  function isLessonUnlocked(unitIdx: number, li: number): boolean {
    if (unlockDraft.freeMode) return true;
    if (li === 0) return true; // First lesson always unlocked
    if (unlockDraft.lessons[unitIdx + '_' + li]) return true;
    // Also unlocked if previous lesson quiz was passed
    const u = $unitsData[unitIdx];
    if (u && u.lessons[li - 1] && $hasPassed('lq_' + u.lessons[li - 1].id)) return true;
    return false;
  }
  function toggleFreeMode() {
    unlockDraft = { ...unlockDraft, freeMode: !unlockDraft.freeMode };
    unlockDirty = true;
  }
  function toggleUnitUnlock(unitIdx: number) {
    const arr = unlockDraft.units.slice();
    const i = arr.indexOf(unitIdx);
    if (i === -1) arr.push(unitIdx); else arr.splice(i, 1);
    unlockDraft = { ...unlockDraft, units: arr };
    unlockDirty = true;
  }
  function toggleLessonUnlock(unitIdx: number, li: number) {
    const key = unitIdx + '_' + li;
    const les = { ...unlockDraft.lessons };
    if (les[key]) delete les[key]; else les[key] = true;
    unlockDraft = { ...unlockDraft, lessons: les };
    unlockDirty = true;
  }
  function toggleLessonDrawer(unitIdx: number) {
    activeDrawerUnit = activeDrawerUnit === unitIdx ? -1 : unitIdx;
  }

  async function saveUnlock() {
    const sid = $activeStudentId;
    if (!sid) return;
    savingUnlock = true; unlockMsg = ''; unlockMsgErr = false;
    try {
      const r = await supabase.rpc('update_unlock_settings', { p_student_id: sid, p_settings: unlockDraft });
      if (r.error) throw r.error;
      unlockDirty = false;
      unlockMsg = '✅ Saved!'; unlockMsgErr = false;
      setTimeout(() => { unlockMsg = ''; }, 2000);
    } catch {
      unlockMsg = '❌ Save failed — check connection.'; unlockMsgErr = true;
    }
    savingUnlock = false;
  }

  async function relockAll() {
    if (!confirm('Remove all unit and lesson unlocks for this student?')) return;
    unlockDraft = { freeMode: false, units: [], lessons: {} };
    unlockDirty = false; activeDrawerUnit = -1;
    const sid = $activeStudentId;
    if (!sid) return;
    try {
      await supabase.rpc('update_unlock_settings', { p_student_id: sid, p_settings: unlockDraft });
      unlockMsg = '🔒 All locks restored.'; unlockMsgErr = false;
      setTimeout(() => { unlockMsg = ''; }, 2000);
    } catch { /* silently ignore — draft was already reset */ }
  }

  async function fullReset() {
    const sid = $activeStudentId;
    if (!confirm('DELETE all quiz scores and mastery data for this student? This cannot be undone.')) return;
    if (!sid) return;
    try {
      const r = await supabase.rpc('reset_student_data', { p_student_id: sid });
      if (r.error) throw r.error;
      // Clear local stores so the dashboard reflects the reset immediately
      scores.set([]);
      mastery.set({});
      streak.set(DEFAULT_STREAK);
      done.set({});
      appTime.set(DEFAULT_APP_TIME);
      actDates.set([]);
      unlockMsg = '🗑 Student data cleared.'; unlockMsgErr = false;
      setTimeout(() => { unlockMsg = ''; }, 3000);
    } catch {
      unlockMsg = '❌ Reset failed — check connection.'; unlockMsgErr = true;
    }
  }

  // ── Timer state ───────────────────────────────────────────────────────────

  let timerDraft = $state({ enabled: true, lessonSecs: 300, unitSecs: 600, finalSecs: 3600 });
  let timerMsg   = $state('');
  let timerMsgErr= $state(false);

  function adjustTimer(type: 'lesson' | 'unit' | 'final', delta: number) {
    const key = type === 'final' ? 'finalSecs' : type === 'unit' ? 'unitSecs' : 'lessonSecs';
    let cur = timerDraft[key];
    let nv: number;
    if (delta > 0) { nv = cur < 60 ? Math.min(60, cur + 1) : cur + 60; }
    else           { nv = cur <= 60 ? Math.max(1, cur - 1) : cur - 60; }
    timerDraft = { ...timerDraft, [key]: Math.min(7200, Math.max(1, nv)) };
  }

  async function saveTimer() {
    const sid = $activeStudentId;
    if (!sid) { timerMsg = 'No student selected.'; timerMsgErr = true; return; }
    try {
      const r = await supabase.rpc('update_timer_settings', { p_student_id: sid, p_settings: timerDraft });
      if (r.error) throw r.error;
      timerMsg = '✅ Saved!'; timerMsgErr = false;
      setTimeout(() => { timerMsg = ''; }, 2000);
    } catch {
      timerMsg = '❌ Save failed.'; timerMsgErr = true;
    }
  }

  // ── Accessibility state ───────────────────────────────────────────────────

  let a11yDraft  = $state({ largeText: false, highContrast: false, colorblind: false, haptic: true, reduceMotion: false, textSelect: false, focus: false, screenreader: false });
  let a11yMsg    = $state('');
  let a11yMsgErr = $state(false);

  function toggleA11y(key: string) {
    a11yDraft = { ...a11yDraft, [key]: !(a11yDraft as Record<string, boolean>)[key] };
  }

  async function saveA11y() {
    const sid = $activeStudentId;
    if (!sid) { a11yMsg = 'No student selected.'; a11yMsgErr = true; return; }
    try {
      const r = await supabase.rpc('update_a11y_settings', { p_student_id: sid, p_settings: a11yDraft });
      if (r.error) throw r.error;
      a11yMsg = '✅ Saved!'; a11yMsgErr = false;
      setTimeout(() => { a11yMsg = ''; }, 2000);
    } catch {
      a11yMsg = '❌ Save failed.'; a11yMsgErr = true;
    }
  }

  // ── Change parent PIN ─────────────────────────────────────────────────────

  let pinInp1   = $state('');
  let pinInp2   = $state('');
  let pinMsg    = $state('');
  let pinMsgErr = $state(false);

  async function hashPin(pin: string): Promise<string> {
    const enc  = new TextEncoder();
    const key  = await crypto.subtle.importKey('raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']);
    const salt = enc.encode('mymathroots_pin_v2');
    const bits = await crypto.subtle.deriveBits({ name:'PBKDF2', hash:'SHA-256', salt, iterations:100000 }, key, 256);
    return Array.from(new Uint8Array(bits)).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  async function savePin() {
    const pin = pinInp1.trim();
    if (pin.length < 4) { pinMsg = 'PIN must be at least 4 digits.'; pinMsgErr = true; return; }
    if (pin !== pinInp2.trim()) { pinMsg = 'PINs do not match.'; pinMsgErr = true; return; }
    pinMsg = 'Saving…'; pinMsgErr = false;
    try {
      const hash = await hashPin(pin);
      const r = await supabase.rpc('update_pin_hash', { p_hash: hash });
      if (r.error) throw r.error;
      pinInp1 = ''; pinInp2 = '';
      pinMsg = '✅ PIN updated — takes effect on next device sync.'; pinMsgErr = false;
      setTimeout(() => { pinMsg = ''; }, 4000);
    } catch {
      pinMsg = '❌ Save failed — check connection.'; pinMsgErr = true;
    }
  }

  // ── Reminders state ───────────────────────────────────────────────────────

  const _REMINDERS_KEY = 'wb_reminders';
  let reminders    = $state({ enabled: false, time: '15:30' });
  let pushMsg      = $state('');
  let pushMsgErr   = $state(false);
  let notifSupport = $state(false);

  function loadReminders() {
    try { return JSON.parse(localStorage.getItem(_REMINDERS_KEY) || 'null') || {}; }
    catch { return {}; }
  }
  function saveReminders(obj: Record<string, unknown>) {
    localStorage.setItem(_REMINDERS_KEY, JSON.stringify(obj));
  }

  async function togglePush() {
    if (!notifSupport) { pushMsg = 'Not supported on this browser.'; pushMsgErr = true; return; }
    const r  = loadReminders();
    const on = r.enabled === true && (typeof Notification !== 'undefined') && Notification.permission === 'granted';
    if (on) {
      saveReminders({ ...r, enabled: false });
      reminders = { ...reminders, enabled: false };
      pushMsg = 'Reminders disabled.'; pushMsgErr = false;
      setTimeout(() => { pushMsg = ''; }, 2000);
    } else {
      pushMsg = 'Requesting permission…'; pushMsgErr = false;
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        const t = r.time || '15:30';
        saveReminders({ ...r, enabled: true, time: t });
        reminders = { enabled: true, time: t };
        pushMsg = `✅ Reminders on — will show at ${t} when browser is open.`; pushMsgErr = false;
      } else {
        pushMsg = 'Permission denied — enable in browser settings.'; pushMsgErr = true;
      }
      setTimeout(() => { pushMsg = ''; }, 4000);
    }
  }

  function saveReminderTime() {
    const r = loadReminders();
    saveReminders({ ...r, time: reminders.time });
    pushMsg = '✅ Reminder time saved.'; pushMsgErr = false;
    setTimeout(() => { pushMsg = ''; }, 2000);
  }

  // ── Change password ───────────────────────────────────────────────────────

  let pwInp    = $state('');
  let pwMsg    = $state('');
  let pwMsgErr = $state(false);

  async function savePassword() {
    if (pwInp.length < 8) { pwMsg = 'Password must be at least 8 characters.'; pwMsgErr = true; return; }
    pwMsg = 'Saving…'; pwMsgErr = false;
    const result = await supabase.auth.updateUser({ password: pwInp });
    if (result.error) { pwMsg = '❌ ' + result.error.message; pwMsgErr = true; return; }
    pwInp = '';
    pwMsg = '✅ Password changed!'; pwMsgErr = false;
    setTimeout(() => { pwMsg = ''; }, 2000);
  }

  // ── Feedback state ────────────────────────────────────────────────────────

  let fbRating   = $state(0);
  let fbCategory = $state('');
  let fbComment  = $state('');
  let fbMsg      = $state('');
  let fbMsgErr   = $state(false);
  const FB_CATS  = ['General', 'Bug Report', 'Feature Request', 'Content Issue'];

  function setFbRating(v: number) { fbRating = fbRating === v ? 0 : v; }
  function setFbCategory(cat: string) { fbCategory = fbCategory === cat ? '' : cat; }

  async function submitFeedback() {
    if (!fbRating) { fbMsg = 'Please select a star rating.'; fbMsgErr = true; return; }
    if (!fbCategory) { fbMsg = 'Please select a category.'; fbMsgErr = true; return; }
    fbMsg = 'Sending…'; fbMsgErr = false;
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const r = await supabase.from('feedback').insert({
        rating: fbRating, category: fbCategory,
        comment: fbComment.slice(0, 500) || null,
        user_id: user?.id || null,
      });
      if (r.error) throw r.error;
      fbRating = 0; fbCategory = ''; fbComment = '';
      fbMsg = '✅ Thank you for your feedback!'; fbMsgErr = false;
      setTimeout(() => { fbMsg = ''; }, 3000);
    } catch {
      fbMsg = '❌ Could not send — check connection.'; fbMsgErr = true;
    }
  }

  // ── Quiz review modal ─────────────────────────────────────────────────────

  let reviewOpen  = $state(false);
  let reviewEntry = $state<ScoreEntry | null>(null);

  function openReview(entry: ScoreEntry) {
    reviewEntry = entry;
    reviewOpen  = true;
  }
  function closeReview() { reviewOpen = false; }

  // Helper: get answer text from a QuizAnswer
  function chosenText(a: QuizAnswer): string {
    if (a.chosen === null || a.chosen === undefined) return '(no answer)';
    if (a.opts && a.opts[a.chosen] !== undefined) return a.opts[a.chosen];
    return String(a.chosen);
  }
  function correctText(a: QuizAnswer): string {
    if (a.opts && a.opts[a.correct] !== undefined) return a.opts[a.correct];
    return String(a.correct);
  }

  // ── PIN reset sheet (for Manage Profiles) ────────────────────────────────

  let pinResetOpen      = $state(false);
  let pinResetStudentId = $state<string | null>(null);
  let pinResetName      = $state('');
  let pinResetBuffer    = $state<string[]>([]);
  let pinResetMsg       = $state('');
  let savingPinReset    = $state(false);

  function openPinReset(sid: string, name: string) {
    pinResetStudentId = sid; pinResetName = name;
    pinResetBuffer = []; pinResetMsg = ''; pinResetOpen = true;
  }
  function closePinReset() { pinResetOpen = false; pinResetStudentId = null; pinResetBuffer = []; }
  function pinKey(digit: string) {
    if (pinResetBuffer.length >= 4) return;
    pinResetBuffer = [...pinResetBuffer, digit];
  }
  function pinBack() {
    if (!pinResetBuffer.length) return;
    pinResetBuffer = pinResetBuffer.slice(0, -1);
  }

  async function savePinReset() {
    if (pinResetBuffer.length < 4 || !pinResetStudentId) return;
    savingPinReset = true;
    try {
      const enc     = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(pinResetBuffer.join('') + 'mymathroots_pin_salt_2025'));
      const newHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
      const r = await supabase.from('student_profiles').update({ pin_hash: newHash, updated_at: new Date().toISOString() }).eq('id', pinResetStudentId);
      if (r.error) throw r.error;
      closePinReset();
    } catch {
      pinResetMsg = 'Error saving PIN. Try again.';
    }
    savingPinReset = false;
  }

  // ── Load settings on mount / student change ───────────────────────────────

  async function loadUnlock(sid: string) {
    if (!sid) { unlockDraft = { freeMode: false, units: [], lessons: {} }; return; }
    try {
      const r = await supabase.rpc('get_unlock_settings', { p_student_id: sid });
      const d = r.data || {};
      unlockDraft = { freeMode: d.freeMode === true, units: Array.isArray(d.units) ? d.units : [], lessons: (d.lessons && typeof d.lessons === 'object') ? d.lessons : {} };
    } catch { unlockDraft = { freeMode: false, units: [], lessons: {} }; }
  }

  async function loadTimer(sid: string) {
    if (!sid) { timerDraft = { enabled: true, lessonSecs: 300, unitSecs: 600, finalSecs: 3600 }; return; }
    try {
      const r = await supabase.rpc('get_timer_settings', { p_student_id: sid });
      const d = r.data || {};
      timerDraft = {
        enabled:    d.enabled !== false,
        lessonSecs: typeof d.lessonSecs === 'number' ? d.lessonSecs : 300,
        unitSecs:   typeof d.unitSecs   === 'number' ? d.unitSecs   : 600,
        finalSecs:  typeof d.finalSecs  === 'number' ? d.finalSecs  : 3600,
      };
    } catch { timerDraft = { enabled: true, lessonSecs: 300, unitSecs: 600, finalSecs: 3600 }; }
  }

  const DEFAULT_A11Y = { largeText: false, highContrast: false, colorblind: false, haptic: true, reduceMotion: false, textSelect: false, focus: false, screenreader: false };

  async function loadA11y(sid: string) {
    if (!sid) { a11yDraft = { ...DEFAULT_A11Y }; return; }
    try {
      const r = await supabase.rpc('get_a11y_settings', { p_student_id: sid });
      const d = r.data || {};
      a11yDraft = { ...DEFAULT_A11Y, ...Object.fromEntries(Object.entries(d).filter(([, v]) => typeof v === 'boolean')) };
    } catch { a11yDraft = { ...DEFAULT_A11Y }; }
  }

  let lastReminderDate = '';

  onMount(() => {
    notifSupport = 'Notification' in window;
    const r = loadReminders();
    reminders = { enabled: r.enabled === true, time: r.time || '15:30' };
    if (notifSupport && r.enabled && Notification.permission !== 'granted') {
      reminders = { ...reminders, enabled: false };
      saveReminders({ ...r, enabled: false });
    }

    // Poll every 60s to fire a reminder notification at the scheduled time
    const reminderInterval = setInterval(() => {
      try {
        if (!notifSupport || Notification.permission !== 'granted') return;
        const rr = loadReminders();
        if (!rr?.enabled || !rr?.time) return;
        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        if (lastReminderDate === todayStr) return;
        const [hh, mm] = rr.time.split(':').map(Number);
        if (now.getHours() >= hh && now.getMinutes() >= mm) {
          lastReminderDate = todayStr;
          new Notification('My Math Roots', {
            body: 'Time for math practice! Keep your streak going.',
            icon: '/icon-192.png',
          });
        }
      } catch { /* ignore */ }
    }, 60_000);

    return () => clearInterval(reminderInterval);
  });

  $effect(() => {
    const sid = $activeStudentId ?? '';
    if (sid) { loadUnlock(sid); loadTimer(sid); loadA11y(sid); }
  });

  // ── Family Code ───────────────────────────────────────────────────────────
  let familyCode = $state<string | null>(null);

  // ── Avatar helpers ────────────────────────────────────────────────────────
  const AVATAR_EMOJIS = ['🦁','🦋','🐉','🦊','🐬','🌟'] as const;
  const AVATAR_COLORS: Record<string, [string, string]> = {
    '🦁': ['#f59e0b','#f97316'], '🦋': ['#8b5cf6','#ec4899'],
    '🐉': ['#06b6d4','#3b82f6'], '🦊': ['#ef4444','#f97316'],
    '🐬': ['#10b981','#0ea5e9'], '🌟': ['#f59e0b','#eab308'],
  };

  // ── Add Student modal ─────────────────────────────────────────────────────
  let addOpen    = $state(false);
  let addName    = $state('');
  let addAge     = $state('');
  let addEmoji   = $state('🦁');
  let addPinBuf  = $state<string[]>([]);
  let addMsg     = $state('');
  let addSaving  = $state(false);

  function openAdd() { addOpen = true; addName = ''; addAge = ''; addEmoji = '🦁'; addPinBuf = []; addMsg = ''; addSaving = false; }
  function closeAdd() { addOpen = false; }
  function addPinKey(d: string) { if (addPinBuf.length >= 4) return; addPinBuf = [...addPinBuf, d]; }
  function addPinBack() { addPinBuf = addPinBuf.slice(0, -1); }

  async function addSave() {
    if (!addName.trim()) { addMsg = 'Name is required.'; return; }
    if (addPinBuf.length < 4) { addMsg = 'Enter a 4-digit PIN.'; return; }
    addSaving = true; addMsg = '';
    try {
      const enc = new TextEncoder();
      const hashBuf = await crypto.subtle.digest('SHA-256', enc.encode(addPinBuf.join('') + 'mymathroots_pin_salt_2025'));
      const pinHash = Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2,'0')).join('');
      const emoji = addEmoji;
      const colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
      const username = addName.trim().toLowerCase().replace(/\s+/g,'_').replace(/[^a-z0-9_]/g,'').slice(0,20) || 'student';
      const ageVal = addAge ? (parseInt(addAge) || null) : null;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { addMsg = 'Session expired — please sign out and sign in again.'; addSaving = false; return; }
      const r = await supabase.from('student_profiles').insert({
        parent_id: user.id, username, display_name: addName.trim(), age: ageVal,
        avatar_emoji: emoji, avatar_color_from: colors[0], avatar_color_to: colors[1],
        pin_hash: pinHash,
      });
      if (r.error) throw r.error;
      const { profiles } = await getStudentProfiles();
      familyProfiles.set(profiles);
      closeAdd();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : (typeof e === 'object' && e !== null && 'message' in e ? String((e as Record<string, unknown>).message) : String(e));
      console.error('[addSave] error:', e);
      addMsg = msg.includes('unique') ? 'A student with that name already exists.' : `Error: ${msg || 'Unknown error'}`;
    }
    addSaving = false;
  }

  // ── Edit Profile modal ────────────────────────────────────────────────────
  let editOpen      = $state(false);
  let editStudentId = $state<string | null>(null);
  let editName      = $state('');
  let editAge       = $state('');
  let editEmoji     = $state('🦁');
  let editMsg       = $state('');
  let editSaving    = $state(false);

  function openEdit(p: { id: string; display_name: string; age?: number | null; avatar_emoji: string }) {
    editStudentId = p.id; editName = p.display_name; editAge = p.age ? String(p.age) : '';
    editEmoji = p.avatar_emoji || '🦁'; editMsg = ''; editOpen = true;
  }
  function closeEdit() { editOpen = false; editStudentId = null; }

  async function editSave() {
    if (!editName.trim()) { editMsg = 'Name is required.'; return; }
    if (!editStudentId) return;
    editSaving = true; editMsg = '';
    try {
      const emoji = editEmoji;
      const colors = AVATAR_COLORS[emoji] || ['#f59e0b','#f97316'];
      const ageVal = editAge ? (parseInt(editAge) || null) : null;
      const r = await supabase.from('student_profiles').update({
        display_name: editName.trim(), age: ageVal,
        avatar_emoji: emoji, avatar_color_from: colors[0], avatar_color_to: colors[1],
        updated_at: new Date().toISOString(),
      }).eq('id', editStudentId);
      if (r.error) throw r.error;
      const { profiles } = await getStudentProfiles();
      familyProfiles.set(profiles);
      closeEdit();
    } catch { editMsg = 'Error saving. Try again.'; }
    editSaving = false;
  }

  // ── Auth provider detection ────────────────────────────────────────────────
  let isGoogleAuth = $state(false);

  // ── Fetch family code + profiles on mount ──────────────────────────────────
  let dashReady = $state(false);

  onMount(async () => {
    // Auth guard — check local session first (instant), then verify with server if needed
    let user: any = null;

    // Fast path: read from localStorage (no network call)
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) {
      user = sessionData.session.user;
    }

    // Slow path: verify with Supabase server (handles token refresh, OAuth callbacks)
    if (!user) {
      for (let i = 0; i < 15; i++) {
        const { data } = await supabase.auth.getUser();
        if (data.user) { user = data.user; break; }
        await new Promise(r => setTimeout(r, 400));
      }
    }

    if (!user) { goto('/login'); return; }

    // Detect Google auth — hide Change Password for OAuth users
    isGoogleAuth = user.app_metadata?.provider === 'google'
      || user.identities?.some((i: any) => i.provider === 'google') || false;

    try {
      const r = await supabase.from('profiles').select('family_code').eq('id', user.id).single();
      if (!r.error && r.data) familyCode = r.data.family_code || null;
    } catch { /* silently ignore */ }

    // Always refresh profiles from Supabase on dashboard load
    try {
      const { profiles } = await getStudentProfiles();
      if (profiles.length > 0) {
        familyProfiles.set(profiles);
        // Auto-select first profile if none selected
        if (!$activeStudentId) activeStudentId.set(profiles[0].id);
      }
    } catch { /* silently ignore */ }

    dashReady = true;
  });
</script>

{#if !dashReady}
  <main class="dash-page" style="display:flex;align-items:center;justify-content:center;min-height:60vh;">
    <div style="text-align:center;color:#546e7a;font-size:1.1rem;">Loading dashboard…</div>
  </main>
{:else}
<main class="dash-page">

{#if reportView}
  <!-- ── AI Report view (full-body swap, legacy pattern) ── -->
  {#if aiLoading}
    <div class="db-ai-loading">
      <div class="db-ai-spinner"></div>
      <div class="db-ai-loading-txt">Analysing {$activeStudent?.display_name ?? 'Student'}'s progress…</div>
      <div class="db-ai-loading-sub">This takes about 5 seconds</div>
    </div>
  {:else}
    <div class="db-ai-sections">
      {#each reportSections as s}
        <div class="db-ai-section" style="border-left:3px solid {s.col}">
          <div class="db-ai-section-title" style="color:{s.col}">{s.hdr}</div>
          <div class="db-ai-section-body">{s.bod}</div>
        </div>
      {/each}
    </div>
  {/if}
{:else}

<!-- ── Manage Profiles ──────────────────────────────────────────────────── -->
<section class="db-section db-profiles-section" id="db-manage-profiles-section">
  <div class="db-sec-hdr">
    <h2 class="db-sec-h" style="margin:0">{@html ICON_PERSON} Manage Profiles</h2>
    <button class="db-add-student-btn" onclick={openAdd}>+ Add Student</button>
  </div>

  {#if familyCode}
    <div class="db-family-code-banner">
      {@html ICON_KEY} <strong>Family Code:</strong>
      <span class="db-family-code-val">{familyCode}</span>
      <span class="db-family-code-hint">— share with your child's device to link profiles</span>
    </div>
  {/if}

  {#if $familyProfiles.length === 0}
    <p class="db-empty">No student profiles yet. Add your first student above.</p>
  {:else}
    <div class="db-profiles-list">
      {#each $familyProfiles as p}
        <div class="db-profile-row">
          <div class="db-profile-avatar" style="background: linear-gradient(135deg, {validColor(p.avatar_color_from)}, {validColor(p.avatar_color_to)})">
            {@html AVATAR_SVG[p.avatar_emoji] ?? p.avatar_emoji}
          </div>
          <div class="db-profile-info">
            <div class="db-profile-name">{p.display_name} {#if p.age}<span class="db-profile-age">Age {p.age}</span>{/if}</div>
          </div>
          <div class="db-profile-btns">
            <button class="db-profile-edit-btn" onclick={() => openEdit(p)}>Edit</button>
            <button class="db-profile-pin-btn" onclick={() => openPinReset(p.id, p.display_name)}>PIN</button>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>

<!-- ── Weekly Snapshot ────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_CALENDAR} This Week</h2>
  <div class="ws-grid">
    <!-- Time practiced -->
    <div class="ws-widget">
      <div class="ws-widget-icon">{@html ICON_TIMER}</div>
      <div class="ws-widget-val">{weeklySnapshot.weekMins > 0 ? weeklySnapshot.timeStr : '—'}</div>
      <div class="ws-widget-lbl">Time Practiced</div>
    </div>
    <!-- Streak -->
    <div class="ws-widget">
      <div class="ws-widget-icon">{@html ICON_FLAME}</div>
      <div class="ws-widget-val">{weeklySnapshot.cur} day{weeklySnapshot.cur !== 1 ? 's' : ''}</div>
      <div class="ws-streak-row">
        {#each Array(7) as _, j}
          <span class="ws-dot {j < Math.min(weeklySnapshot.cur, 7) ? 'ws-dot-lit' : ''}"></span>
        {/each}
        {#if weeklySnapshot.cur > 7}<span class="ws-streak-more">+{weeklySnapshot.cur - 7}</span>{/if}
      </div>
      <div class="ws-widget-lbl">Streak</div>
    </div>
    <!-- Lessons this week -->
    <div class="ws-widget">
      <div class="ws-widget-icon">{@html ICON_BOOK}</div>
      <div class="ws-widget-val">{weeklySnapshot.weekLessons}</div>
      <div class="ws-widget-lbl">Lessons This Week</div>
    </div>
  </div>
</section>

<!-- ── Root System ────────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html SPROUT_SVG}The Root System</h2>
  <div class="rs-legend">
    <span class="rs-leg-item"><span class="rs-leg-dot" style="background:#2e7d32"></span>Mastered</span>
    <span class="rs-leg-item"><span class="rs-leg-dot" style="background:#f57f17"></span>In Progress</span>
    <span class="rs-leg-item"><span class="rs-leg-dot" style="background:#c62828"></span>Needs Work</span>
    <span class="rs-leg-item"><span class="rs-leg-dot" style="background:#cfd8dc"></span>Not Started</span>
  </div>
  <div class="rs-summary">{rootSummary.mastered} of 10 units mastered · {rootSummary.touched} started</div>
  <div class="rs-track">
    {#each rootNodes as node, i}
      {@const col  = stateColor[node.state]}
      {@const icon = stateIcon[node.state]}
      {@const lbl  = stateLabel[node.state]}
      {@const isRight = i % 2 === 0}
      <div class="rs-row {isRight ? 'rs-row-right' : 'rs-row-left'}">
        {#if !isRight}
          <div class="rs-label">
            <div class="rs-lbl-name">{node.name}</div>
            <div class="rs-lbl-sub" style="color:{col}">{lbl}{node.avg > 0 ? ' · ' + node.avg + '%' : ''}</div>
          </div>
        {/if}
        <div class="rs-node-col">
          <div class="rs-node {node.state === 'locked' ? 'rs-node-locked' : ''}"
               style="border-color:{col}; background:{node.state === 'locked' ? '#f5f5f5' : col + '18'}">
            <span class="rs-node-num" style="color:{col}">{i + 1}</span>
            <span class="rs-node-icon">{@html icon}</span>
          </div>
          {#if i < rootNodes.length - 1}
            <div class="rs-spine {node.state !== 'locked' ? 'rs-spine-active' : ''}"
                 style="{node.state !== 'locked' ? 'background:' + col : ''}"></div>
          {/if}
        </div>
        {#if isRight}
          <div class="rs-label">
            <div class="rs-lbl-name">{node.name}</div>
            <div class="rs-lbl-sub" style="color:{col}">{lbl}{node.avg > 0 ? ' · ' + node.avg + '%' : ''}</div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</section>

<!-- ── Overview Stats ─────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">Overview</h2>
  <div class="db-stat-grid">
    <div class="db-stat-card" style="background:#e8f5e9">
      <div class="db-stat-val" style="color:{pctColor(overallStats.accuracy)}">{overallStats.accuracy}%</div>
      <div class="db-stat-lbl" style="color:{pctColor(overallStats.accuracy)}">Accuracy</div>
    </div>
    <div class="db-stat-card" style="background:#e3f2fd">
      <div class="db-stat-val" style="color:#1565C0">{overallStats.quizCount}</div>
      <div class="db-stat-lbl" style="color:#1565C0">Quizzes</div>
    </div>
    <div class="db-stat-card" style="background:#fff8e1">
      <div class="db-stat-val" style="color:#f57f17">{overallStats.streak}{@html ICON_FLAME}</div>
      <div class="db-stat-lbl" style="color:#f57f17">Streak</div>
    </div>
    <div class="db-stat-card" style="background:#ede7f6">
      {#if Math.round(overallStats.weekSecs / 60) >= 60}
        {@const wm = Math.round(overallStats.weekSecs / 60)}
        <div class="db-stat-val" style="color:#512da8">{Math.floor(wm/60)}h {String(wm%60).padStart(2,'0')}m</div>
      {:else}
        <div class="db-stat-val" style="color:#512da8">{Math.round(overallStats.weekSecs / 60)}m</div>
      {/if}
      <div class="db-stat-lbl" style="color:#512da8">This Week</div>
    </div>
  </div>
  {#if overallStats.lastActive}
    <p class="db-last-active">Last active: {overallStats.lastActive}</p>
  {/if}
</section>

<!-- ── Time breakdown ─────────────────────────────────────────────────────── -->
{#if timeBreakdown.hasAny}
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_TIMER} Time</h2>
  <div class="db-time-box">
    {#if $appTime.totalSecs > 0}
      <div class="db-time-row"><span class="db-time-lbl">This week in app</span><span class="db-time-val">{fmtSecs(timeBreakdown.weekSecs)}</span></div>
      <div class="db-time-row"><span class="db-time-lbl">Total time in app</span><span class="db-time-val">{fmtSecs(timeBreakdown.totalSecs)}</span></div>
      <div class="db-time-row"><span class="db-time-lbl">Avg session length</span><span class="db-time-val">{fmtSecs(timeBreakdown.avgSession)}</span></div>
    {/if}
    {#if timeBreakdown.withTime > 0}
      <div class="db-time-sep"></div>
      {#if timeBreakdown.avgLesson}<div class="db-time-row"><span class="db-time-lbl">Avg lesson quiz time</span><span class="db-time-val">{fmtSecs(timeBreakdown.avgLesson)}</span></div>{/if}
      {#if timeBreakdown.avgUnit}  <div class="db-time-row"><span class="db-time-lbl">Avg unit test time</span><span class="db-time-val">{fmtSecs(timeBreakdown.avgUnit)}</span></div>{/if}
      {#if timeBreakdown.avgFinal}<div class="db-time-row"><span class="db-time-lbl">Avg final test time</span><span class="db-time-val">{fmtSecs(timeBreakdown.avgFinal)}</span></div>{/if}
    {/if}
    {#if timeBreakdown.avgQ > 0}
      <div class="db-time-sep"></div>
      <div class="db-time-row"><span class="db-time-lbl">Avg time per question</span><span class="db-time-val">{timeBreakdown.avgQ}s</span></div>
    {/if}
  </div>
</section>
{/if}

<!-- ── Recent Quizzes ──────────────────────────────────────────────────────── -->
{#if recentQuizzes.length > 0}
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_CLIPBOARD} Recent Quizzes</h2>
  <div class="db-quiz-list">
    {#each recentQuizzes as s, idx}
      {@const pColor = pctColor(s.pct)}
      {@const color  = s.color || COLORS[idx % COLORS.length]}
      {@const qAvg   = quizAvgQSecs(s)}
      {@const hasQT  = s.answers?.some(a => a.timeSecs != null)}
      <button type="button" class="db-quiz-row" onclick={() => openReview(s)}>
        <div class="db-quiz-bar" style="background:{color}"></div>
        <div class="db-quiz-info">
          <div class="db-quiz-label">{s.label || typeLabel(s.type)}</div>
          <div class="db-quiz-sub">
            {s.date || ''}{s.date ? ' · ' : ''}{typeLabel(s.type)}{hasQT ? ' · ⏱ ' + qAvg + 's/q' : ''}
            <span style="color:{color}"> View details →</span>
          </div>
        </div>
        <div class="db-quiz-score" style="color:{pColor}">
          {s.pct}%
          <div class="db-quiz-frac">{s.score}/{s.total}</div>
        </div>
      </button>
    {/each}
  </div>
</section>
{/if}

<!-- ── Skills by Unit ─────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">Skills by Unit</h2>
  {#if skillBreakdown.length === 0}
    <p class="db-empty">No unit quizzes completed yet.</p>
  {:else}
    {#each skillBreakdown as s}
      {@const c   = s.accuracy >= 80 ? '#2e7d32' : s.accuracy >= 60 ? '#f57f17' : '#c62828'}
      {@const lbl = s.accuracy >= 80 ? '✅ Strong' : s.accuracy >= 60 ? '⚠️ Developing' : '❌ Needs Work'}
      <div class="db-skill-row">
        <div class="db-skill-top">
          <span class="db-skill-name">{s.label}</span>
          <span class="db-skill-badge" style="color:{c}">{lbl}</span>
        </div>
        <div class="db-bar-bg"><div class="db-bar-fill" style="width:{s.accuracy}%;background:{c}"></div></div>
        <div class="db-skill-sub">{s.accuracy}% · {s.correct} correct / {s.total} attempted</div>
      </div>
    {/each}
  {/if}
</section>

<!-- ── Needs Attention ────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_WARNING} Needs Attention</h2>
  {#if weakAreas.length === 0}
    <p class="db-empty">No weak areas — great work! 🎉</p>
  {:else}
    {#each weakAreas as s}
      <div class="db-weak-item">
        <span class="db-weak-name">{s.label}</span>
        <span class="db-weak-pct">{s.accuracy}% · {s.total} questions</span>
      </div>
    {/each}
  {/if}
</section>

<!-- ── Needs More Practice ────────────────────────────────────────────────── -->
{#if practiceSpotlight.length > 0}
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_MEMO} Needs More Practice</h2>
  <div class="db-practice-list">
    {#each practiceSpotlight as e}
      <div class="db-practice-item">
        <div class="db-practice-txt">{e.key.slice(0, 90)}</div>
        <div class="db-practice-sub">{e.acc}% correct · {e.attempts} attempts</div>
      </div>
    {/each}
  </div>
</section>
{/if}

<!-- ── Review Queue ────────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_CYCLE} Review Queue</h2>
  {#if reviewQueue.length === 0}
    <p class="db-empty">No items scheduled for review yet.</p>
  {:else}
    {@const overdue  = reviewQueue.filter(r => r.overdue).length}
    {@const upcoming = reviewQueue.length - overdue}
    <div class="db-review-summary">
      {#if overdue} <span class="db-badge db-badge-red">{@html ICON_ALARM} {overdue} overdue</span>{/if}
      {#if upcoming}<span class="db-badge db-badge-blue">{@html ICON_CALDAY} {upcoming} upcoming</span>{/if}
    </div>
    {#each reviewQueue.slice(0, 10) as r}
      <div class="db-review-item">
        {#if r.overdue}
          <span class="db-badge db-badge-red">Overdue</span>
        {:else}
          <span class="db-badge db-badge-blue">Upcoming</span>
        {/if}
        <div class="db-review-txt">{r.key.slice(0, 80)}</div>
        <div class="db-review-acc">{r.accuracy}% correct</div>
      </div>
    {/each}
  {/if}
</section>

<!-- ── Activity — Last 7 Days ─────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_CALDAY} Activity — Last 7 Days</h2>
  <div class="db-act-chart">
    {#each activityData.slice().reverse() as d}
      {@const pct = activityMax > 0 ? Math.round((d.quizCount / activityMax) * 100) : 0}
      <div class="db-act-col">
        <div class="db-act-bar-wrap">
          <div class="db-act-bar" style="height:{pct}%;background:{d.quizCount > 0 ? '#1565C0' : 'rgba(0,0,0,.08)'}"></div>
        </div>
        <div class="db-act-n">{d.quizCount || ''}</div>
        <div class="db-act-day">{d.dayLabel}</div>
      </div>
    {/each}
  </div>
</section>

<!-- ── Access Controls ────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_UNLOCK} Access Controls</h2>

  {#if !$activeStudentId}
    <p class="db-empty">Select a student to manage unlock settings.</p>
  {:else}
    <!-- Free Mode toggle -->
    <div class="db-toggle-row">
      <div>
        <strong>{@html ICON_STAR} Free Mode</strong><br>
        <span class="db-toggle-sub">Unlock all units and lessons at once</span>
      </div>
      <button class="db-toggle-btn {unlockDraft.freeMode ? 'db-toggle-on' : ''}"
              onclick={toggleFreeMode}>
        {unlockDraft.freeMode ? 'ON' : 'OFF'}
      </button>
    </div>

    <!-- Unit cards grid -->
    <div class="db-unit-grid" style="{unlockDraft.freeMode ? 'opacity:.5;pointer-events:none' : ''}">
      {#each UNITS_META as u, i}
        {@const earnedUnit = i === 0 || !!($unitsData[i - 1] && $hasPassed($unitsData[i - 1].id + '_uq'))}
        <div class="db-unit-card {isUnitUnlocked(i) ? 'db-unit-unlocked' : ''}">
          <div class="db-unit-card-top">
            <span class="db-unit-num">Unit {i + 1}</span>
            <button class="db-toggle-btn db-toggle-sm {isUnitUnlocked(i) ? 'db-toggle-on' : ''}"
                    disabled={earnedUnit}
                    onclick={() => toggleUnitUnlock(i)}>
              {isUnitUnlocked(i) ? 'ON' : 'OFF'}
            </button>
          </div>
          <div class="db-unit-name">{u.name}</div>
          <button class="db-unit-lessons-link" onclick={() => toggleLessonDrawer(i)}>
            Manage lessons {activeDrawerUnit === i ? '▲' : '▼'}
          </button>
        </div>

        {#if activeDrawerUnit === i}
          <!-- Lesson drawer — full-width after this card's row -->
          <div class="db-lesson-drawer" style="grid-column:1/-1">
            {#each u.lessons as lName, li}
              {@const earnedLesson = li === 0 || ($unitsData[i]?.lessons[li - 1] && $hasPassed('lq_' + $unitsData[i].lessons[li - 1].id))}
              {@const enrichLesson = $unitsData[i]?.lessons[li]?.enrichment}
              <div class="db-lesson-row">
                <span class="db-lesson-name">
                  {lName}
                  {#if enrichLesson}<span class="db-enrich-star" title="Above grade level — enrichment content">⭐</span>{/if}
                </span>
                <button class="db-toggle-btn db-toggle-sm {isLessonUnlocked(i, li) ? 'db-toggle-on' : ''}"
                        disabled={earnedLesson}
                        onclick={() => toggleLessonUnlock(i, li)}>
                  {isLessonUnlocked(i, li) ? 'ON' : 'OFF'}
                </button>
              </div>
            {/each}
          </div>
        {/if}
      {/each}
    </div>

    <div class="db-ctrl-msg" style="color:{unlockMsgErr ? '#c62828' : '#2e7d32'}">{unlockMsg}</div>
    <div class="db-ctrl-btns">
      <button class="db-ctrl-save" onclick={saveUnlock} disabled={savingUnlock}>
        {savingUnlock ? 'Saving…' : 'Save Changes'}
      </button>
      <button class="db-ctrl-relock" onclick={relockAll}>{@html ICON_LOCK} Re-lock All</button>
      <button class="db-ctrl-reset"  onclick={fullReset}>{@html ICON_TRASH} Full Reset</button>
    </div>
  {/if}
</section>

<!-- ── Quiz Timer ─────────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_TIMER} Quiz Timer</h2>
  {#if !$activeStudentId}
    <p class="db-empty">Timer settings require a connected student profile.</p>
  {:else}
    <div class="db-toggle-row">
      <div><strong>{@html ICON_TIMER} Quiz Timer</strong></div>
      <button class="db-toggle-btn {timerDraft.enabled ? 'db-toggle-on' : ''}"
              onclick={() => timerDraft = {...timerDraft, enabled: !timerDraft.enabled}}>
        {timerDraft.enabled ? 'ON' : 'OFF'}
      </button>
    </div>

    {#if timerDraft.enabled}
      {#each ([['lesson','Lesson Quiz','lessonSecs'],['unit','Unit Quiz','unitSecs'],['final','Final Test','finalSecs']] as const) as [type, label, key]}
        <div class="db-timer-row">
          <span class="db-timer-lbl">{label}</span>
          <div class="db-timer-adj">
            <button class="db-adj-btn" onclick={() => adjustTimer(type, -1)}>−</button>
            <span class="db-timer-val">{dbTimerLbl(timerDraft[key])}</span>
            <button class="db-adj-btn" onclick={() => adjustTimer(type, 1)}>+</button>
          </div>
        </div>
      {/each}
    {/if}

    <div class="db-ctrl-msg" style="color:{timerMsgErr ? '#c62828' : '#2e7d32'}">{timerMsg}</div>
    <div class="db-ctrl-btns">
      <button class="db-ctrl-save" onclick={saveTimer}>Save Timer Settings</button>
    </div>
  {/if}
</section>

<!-- ── Accessibility ──────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_A11Y} Accessibility</h2>
  {#if !$activeStudentId}
    <p class="db-empty">Accessibility settings require a connected student profile.</p>
  {:else}
    <div class="db-toggle-row">
      <div>
        <strong>Aa Large Text</strong><br>
        <span class="db-toggle-sub">Increases font size for the student</span>
      </div>
      <button class="db-toggle-btn {a11yDraft.largeText ? 'db-toggle-on' : ''}"
              onclick={() => toggleA11y('largeText')}>
        {a11yDraft.largeText ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="db-toggle-row">
      <div>
        <strong>◑ High Contrast</strong><br>
        <span class="db-toggle-sub">Increases color contrast for readability</span>
      </div>
      <button class="db-toggle-btn {a11yDraft.highContrast ? 'db-toggle-on' : ''}"
              onclick={() => toggleA11y('highContrast')}>
        {a11yDraft.highContrast ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="db-toggle-row">
      <div>
        <strong>Colorblind-friendly answers</strong><br>
        <span class="db-toggle-sub">Adds symbols and border patterns to quiz answers</span>
      </div>
      <button class="db-toggle-btn {a11yDraft.colorblind ? 'db-toggle-on' : ''}"
              onclick={() => toggleA11y('colorblind')}>
        {a11yDraft.colorblind ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="db-toggle-row">
      <div>
        <strong>Reduce motion</strong><br>
        <span class="db-toggle-sub">Turns off slide animations, bouncing, and transitions</span>
      </div>
      <button class="db-toggle-btn {a11yDraft.reduceMotion ? 'db-toggle-on' : ''}"
              onclick={() => toggleA11y('reduceMotion')}>
        {a11yDraft.reduceMotion ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="db-toggle-row">
      <div>
        <strong>Text selection</strong><br>
        <span class="db-toggle-sub">Allows selecting text (helpful for dyslexia tools)</span>
      </div>
      <button class="db-toggle-btn {a11yDraft.textSelect ? 'db-toggle-on' : ''}"
              onclick={() => toggleA11y('textSelect')}>
        {a11yDraft.textSelect ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="db-toggle-row">
      <div>
        <strong>Focus indicators</strong><br>
        <span class="db-toggle-sub">Shows visible outlines for keyboard navigation</span>
      </div>
      <button class="db-toggle-btn {a11yDraft.focus ? 'db-toggle-on' : ''}"
              onclick={() => toggleA11y('focus')}>
        {a11yDraft.focus ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="db-toggle-row">
      <div>
        <strong>Screen reader support</strong><br>
        <span class="db-toggle-sub">Adds labels and announcements for VoiceOver / TalkBack</span>
      </div>
      <button class="db-toggle-btn {a11yDraft.screenreader ? 'db-toggle-on' : ''}"
              onclick={() => toggleA11y('screenreader')}>
        {a11yDraft.screenreader ? 'ON' : 'OFF'}
      </button>
    </div>
    <div class="db-ctrl-msg" style="color:{a11yMsgErr ? '#c62828' : '#2e7d32'}">{a11yMsg}</div>
    <div class="db-ctrl-btns">
      <button class="db-ctrl-save" onclick={saveA11y}>Save Accessibility</button>
    </div>
  {/if}
</section>

<!-- ── Change Parent PIN ──────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_KEY} Change Parent PIN</h2>
  <p class="db-sec-body">Your PIN is used as the local escape hatch on student devices. Changes sync to all devices on next sign-in.</p>
  <div class="db-form-row">
    <label class="db-form-lbl">New PIN</label>
    <input id="db-pin-inp1" type="password" inputmode="numeric" class="db-form-inp"
           placeholder="New PIN (min 4 digits)" bind:value={pinInp1}>
  </div>
  <div class="db-form-row">
    <label class="db-form-lbl">Confirm PIN</label>
    <input id="db-pin-inp2" type="password" inputmode="numeric" class="db-form-inp"
           placeholder="Repeat PIN" bind:value={pinInp2}>
  </div>
  <div class="db-ctrl-msg" style="color:{pinMsgErr ? '#c62828' : '#2e7d32'}">{pinMsg}</div>
  <div class="db-ctrl-btns">
    <button class="db-ctrl-save" onclick={savePin}>Update PIN</button>
  </div>
</section>

<!-- ── Reminders ──────────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_BELL} Reminders</h2>
  <p class="db-sec-body">Daily practice reminders shown when this device's browser is open.</p>
  {#if !notifSupport}
    <p style="color:#c62828;font-size:.82rem;margin-bottom:8px">{@html ICON_WARNING} Notifications not supported on this browser.</p>
  {/if}
  <div class="db-toggle-row">
    <div>
      <strong>Daily reminder</strong><br>
      <span class="db-toggle-sub">Asks {reminders.time} each day</span>
    </div>
    <button class="db-toggle-btn {reminders.enabled ? 'db-toggle-on' : ''}" onclick={togglePush}
            disabled={!notifSupport}>
      {reminders.enabled ? 'ON' : 'OFF'}
    </button>
  </div>
  {#if reminders.enabled}
    <div class="db-form-row" style="margin-top:10px">
      <label class="db-form-lbl">Reminder time</label>
      <input type="time" class="db-form-inp" style="max-width:140px" bind:value={reminders.time}>
    </div>
    <div class="db-ctrl-btns">
      <button class="db-ctrl-save" onclick={saveReminderTime}>Save Time</button>
    </div>
  {/if}
  <div class="db-ctrl-msg" style="color:{pushMsgErr ? '#c62828' : '#2e7d32'}">{pushMsg}</div>
</section>

<!-- ── Change Password (hidden for Google auth users) ─────────────────────── -->
{#if !isGoogleAuth}
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_LOCK} Change Password</h2>
  <div class="db-form-row">
    <label class="db-form-lbl">New Password</label>
    <input id="db-pw-inp" type="password" class="db-form-inp"
           placeholder="Min 8 characters" autocomplete="new-password" bind:value={pwInp}>
  </div>
  <div class="db-ctrl-msg" style="color:{pwMsgErr ? '#c62828' : '#2e7d32'}">{pwMsg}</div>
  <div class="db-ctrl-btns">
    <button class="db-ctrl-save" onclick={savePassword}>Change Password</button>
  </div>
</section>
{/if}

<!-- ── Send Feedback ──────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_CHAT} Send Feedback</h2>
  <div class="db-fb-stars">
    {#each [1,2,3,4,5] as v}
      <button class="db-fb-star" onclick={() => setFbRating(v)}>
        {v <= fbRating ? '★' : '☆'}
      </button>
    {/each}
  </div>
  <div class="db-fb-cats">
    {#each FB_CATS as cat}
      <button class="db-fb-cat {fbCategory === cat ? 'active' : ''}" onclick={() => setFbCategory(cat)}>
        {cat}
      </button>
    {/each}
  </div>
  <textarea class="db-fb-comment" maxlength="500" rows="3"
            placeholder="Comments (optional)" bind:value={fbComment}></textarea>
  <div class="db-ctrl-msg" style="color:{fbMsgErr ? '#c62828' : '#2e7d32'}">{fbMsg}</div>
  <div class="db-ctrl-btns">
    <button class="db-ctrl-save" onclick={submitFeedback}>Send Feedback</button>
  </div>
</section>

<!-- ── What's New ─────────────────────────────────────────────────────────── -->
<section class="db-section">
  <h2 class="db-sec-h">{@html ICON_CLIPBOARD} What's New</h2>
  <div style="max-height:320px;overflow-y:auto">
    <div class="mb-14">
      <div class="cl-version-brand">v5.33 — Current</div>
      <ul class="list-body">
        <li><strong>Parent Dashboard</strong> — All parent controls moved to the dashboard for remote management</li>
        <li><strong>Balanced Final Test</strong> — 50-question final test with guaranteed 5 questions per unit</li>
      </ul>
    </div>
    <div class="mb-14">
      <div class="cl-version">v5.32</div>
      <ul class="list-body">
        <li><strong>Security hardening</strong> — PBKDF2 PIN hashing, HMAC-SHA256 score signing, SWR service worker</li>
        <li><strong>Stable question IDs</strong> — 5,073 unique IDs injected across all 10 units</li>
        <li><strong>Student Profiles</strong> — Multi-student support with family code and PIN login</li>
      </ul>
    </div>
    <div class="mb-14">
      <div class="cl-version">v5.22</div>
      <ul class="list-body">
        <li><strong>Self-hosted fonts</strong> — Boogaloo + Nunito base64 woff2 inline</li>
        <li><strong>Google Sign-In</strong> — Fixed Client Secret and CSP</li>
      </ul>
    </div>
  </div>
</section>

{/if}<!-- end {:else} stats view -->

</main>
{/if}<!-- end dashReady gate -->

<!-- ════════════════════════════════════════
     AI Report — sticky footer
     ════════════════════════════════════════ -->
<footer class="db-ai-footer-wrap" id="db-ai-footer">
  {#if reportView && !aiLoading}
    <!-- Report is showing — back + PDF buttons -->
    <div class="db-ai-footer-btns">
      <button class="db-ai-back-btn" onclick={backToStats}>← Back to Stats</button>
      <button class="db-ai-pdf-btn"  onclick={downloadReportPDF}>💾 Download PDF</button>
    </div>
  {:else}
    <!-- Default — centered generate button -->
    <div style="text-align:center">
      {#if canGenerateReport}
        <button class="db-ai-gen-btn" onclick={generateReport} disabled={aiLoading}>
          {#if aiLoading}<span class="db-ai-spinner"></span> Generating…{:else}{@html ICON_CLIPBOARD} Generate Report{/if}
        </button>
        <div class="db-ai-powered">Powered by Gemini</div>
      {:else}
        <button class="db-ai-gen-btn" disabled style="opacity:.45;cursor:not-allowed">{@html ICON_CLIPBOARD} Generate Report</button>
        <div class="db-ai-powered">Next report available {nextReportDate}</div>
      {/if}
    </div>
    {#if aiError}<p style="font-size:.78rem;color:#c62828;text-align:center;margin:6px 0 0">{aiError}</p>{/if}
  {/if}
</footer>

<!-- ════════════════════════════════════════
     Quiz Review Modal (slide-up sheet)
     ════════════════════════════════════════ -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<div class="db-review-modal {reviewOpen ? 'open' : ''}" role="dialog"
     onclick={(e) => { if (e.target === e.currentTarget) closeReview(); }}>
  <div class="db-review-sheet">
    {#if reviewEntry}
      <div class="db-review-head">
        <button class="db-review-close" onclick={closeReview}>✕</button>
        <div class="db-review-title">{reviewEntry.label || typeLabel(reviewEntry.type)}</div>
        <div class="db-review-meta">
          {reviewEntry.date || ''}{reviewEntry.date ? ' · ' : ''}{typeLabel(reviewEntry.type)}{reviewEntry.timeTaken ? ' · ⏱ ' + reviewEntry.timeTaken : ''}
        </div>
        <div class="db-review-score" style="color:{pctColor(reviewEntry.pct)}">
          {reviewEntry.pct}% <span class="db-review-frac">{reviewEntry.score}/{reviewEntry.total}</span>
        </div>
      </div>
      <div class="db-review-body">
        {#if reviewEntry.answers && reviewEntry.answers.length}
          {@const wrong = reviewEntry.answers.filter(a => !a.ok)}
          {@const right  = reviewEntry.answers.filter(a => a.ok)}
          {#if wrong.length}
            <div class="db-rev-sec" style="color:#c62828">{@html ICON_CROSS_CIRCLE} Incorrect ({wrong.length})</div>
            {#each wrong as a}
              <div class="db-rev-item db-rev-wrong">
                <div class="db-rev-q">{a.t || ''}</div>
                <div class="db-rev-your">Your answer: <span style="color:#c62828">{chosenText(a)}</span></div>
                <div class="db-rev-correct">{@html ICON_CHECK_CIRCLE} Correct: <span style="color:#2e7d32">{correctText(a)}</span></div>
                {#if a.timeSecs != null}<div class="db-rev-time">⏱ {a.timeSecs}s</div>{/if}
              </div>
            {/each}
          {/if}
          {#if right.length}
            <div class="db-rev-sec" style="color:#2e7d32">{@html ICON_CHECK_CIRCLE} Correct ({right.length})</div>
            {#each right as a}
              <div class="db-rev-item db-rev-right">
                <div class="db-rev-q">{a.t || ''}</div>
                <div class="db-rev-correct" style="color:#2e7d32">{@html ICON_CHECK_CIRCLE} {correctText(a)}</div>
                {#if a.timeSecs != null}<div class="db-rev-time">⏱ {a.timeSecs}s</div>{/if}
              </div>
            {/each}
          {/if}
        {:else}
          <div class="db-rev-empty">No question detail available for this attempt.</div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<!-- ════════════════════════════════════════
     PIN Reset Sheet (for Manage Profiles)
     ════════════════════════════════════════ -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<div class="db-review-modal {pinResetOpen ? 'open' : ''}" role="dialog"
     onclick={(e) => { if (e.target === e.currentTarget) closePinReset(); }}>
  <div class="db-review-sheet" style="max-height:70vh">
    <div class="db-review-head">
      <button class="db-review-close" onclick={closePinReset}>✕</button>
      <div class="db-review-title">Reset PIN for {pinResetName}</div>
      <div class="db-review-meta">Enter a new 4-digit PIN</div>
    </div>
    <div class="db-review-body">
      <!-- PIN dots -->
      <div style="display:flex;gap:10px;justify-content:center;margin:16px 0 12px">
        {#each Array(4) as _, i}
          <div style="width:16px;height:16px;border-radius:50%;{i < pinResetBuffer.length ? 'background:#1565C0;box-shadow:0 0 6px rgba(21,101,192,.5)' : 'background:#f0f4f8;border:2px solid #e0e0e0'}"></div>
        {/each}
      </div>
      <!-- Keypad -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:14px;padding:0 2px">
        {#each ['1','2','3','4','5','6','7','8','9'] as d}
          <button class="db-pin-key" onclick={() => pinKey(d)}>{d}</button>
        {/each}
        <div></div>
        <button class="db-pin-key" onclick={() => pinKey('0')}>0</button>
        <button class="db-pin-key db-pin-key-back" onclick={pinBack}>⌫</button>
      </div>
      <div style="font-size:.78rem;color:#e74c3c;text-align:center;min-height:1.1rem;margin-bottom:10px">{pinResetMsg}</div>
      <button onclick={savePinReset} disabled={pinResetBuffer.length < 4 || savingPinReset}
              style="width:100%;padding:12px;border-radius:50px;border:none;background:#1565C0;color:#fff;font-family:'Boogaloo',sans-serif;font-size:1rem;cursor:pointer;opacity:{pinResetBuffer.length < 4 ? 0.5 : 1};pointer-events:{pinResetBuffer.length < 4 ? 'none' : 'auto'}">
        {savingPinReset ? 'Saving...' : 'Save New PIN'}
      </button>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     Add Student Modal
     ════════════════════════════════════════ -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<div class="db-review-modal {addOpen ? 'open' : ''}" role="dialog"
     onclick={(e) => { if (e.target === e.currentTarget) closeAdd(); }}>
  <div class="db-review-sheet">
    <div class="db-review-head">
      <button class="db-review-close" onclick={closeAdd}>✕</button>
      <div class="db-review-title">Add Student</div>
    </div>
    <div class="db-review-body">
      <label class="db-sheet-label">Student Name *</label>
      <input type="text" maxlength="20" placeholder="e.g. Maya" class="db-sheet-inp"
             bind:value={addName}>
      <label class="db-sheet-label">Age (optional)</label>
      <input type="number" min="4" max="18" placeholder="e.g. 9" class="db-sheet-inp"
             bind:value={addAge}>
      <label class="db-sheet-label">Avatar</label>
      <div class="db-avatar-row">
        {#each AVATAR_EMOJIS as em}
          {@const cols = AVATAR_COLORS[em] || ['#f59e0b','#f97316']}
          <button type="button" class="db-avatar-btn {addEmoji === em ? 'selected' : ''}"
                  style="background:linear-gradient(135deg,{cols[0]},{cols[1]})"
                  onclick={() => addEmoji = em}>{@html AVATAR_SVG[em] ?? em}</button>
        {/each}
      </div>
      <label class="db-sheet-label">Create a 4-digit PIN</label>
      <div class="db-pin-dots">
        {#each Array(4) as _, i}
          <div class="db-pin-dot {i < addPinBuf.length ? 'filled' : ''}"></div>
        {/each}
      </div>
      <div class="db-pin-grid">
        {#each ['1','2','3','4','5','6','7','8','9'] as d}
          <button class="db-pin-key" onclick={() => addPinKey(d)}>{d}</button>
        {/each}
        <div></div>
        <button class="db-pin-key" onclick={() => addPinKey('0')}>0</button>
        <button class="db-pin-key db-pin-key-back" onclick={addPinBack}>⌫</button>
      </div>
      {#if addMsg}<div class="db-sheet-msg">{addMsg}</div>{/if}
      <button class="db-sheet-save-btn" onclick={addSave}
              disabled={addPinBuf.length < 4 || addSaving}
              style="opacity:{addPinBuf.length < 4 ? 0.5 : 1}">
        {addSaving ? 'Saving...' : 'Add Student'}
      </button>
    </div>
  </div>
</div>

<!-- ════════════════════════════════════════
     Edit Profile Modal
     ════════════════════════════════════════ -->
<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
<div class="db-review-modal {editOpen ? 'open' : ''}" role="dialog"
     onclick={(e) => { if (e.target === e.currentTarget) closeEdit(); }}>
  <div class="db-review-sheet">
    <div class="db-review-head">
      <button class="db-review-close" onclick={closeEdit}>✕</button>
      <div class="db-review-title">Edit Profile</div>
    </div>
    <div class="db-review-body">
      <label class="db-sheet-label">Name</label>
      <input type="text" maxlength="20" class="db-sheet-inp" bind:value={editName}>
      <label class="db-sheet-label">Age (optional)</label>
      <input type="number" min="4" max="18" class="db-sheet-inp" bind:value={editAge}>
      <label class="db-sheet-label">Avatar</label>
      <div class="db-avatar-row">
        {#each AVATAR_EMOJIS as em}
          {@const cols = AVATAR_COLORS[em] || ['#f59e0b','#f97316']}
          <button type="button" class="db-avatar-btn {editEmoji === em ? 'selected' : ''}"
                  style="background:linear-gradient(135deg,{cols[0]},{cols[1]})"
                  onclick={() => editEmoji = em}>{@html AVATAR_SVG[em] ?? em}</button>
        {/each}
      </div>
      {#if editMsg}<div class="db-sheet-msg">{editMsg}</div>{/if}
      <button class="db-sheet-save-btn" onclick={editSave} disabled={editSaving}>
        {editSaving ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </div>
</div>

<style>
  /* ── Page layout ── */
  .dash-page {
    padding: 8px 14px 80px;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    background: #f0f4f8;
  }

  /* ── Section cards ── */
  .db-section {
    background: #fff;
    border-radius: 16px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,.07);
  }
  .db-sec-h {
    font-size: 1rem;
    font-weight: 700;
    color: #37474f;
    margin: 0 0 12px;
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .db-sec-hdr {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
  }
  .db-sec-body  { font-size:.85rem; color:#546e7a; margin-bottom:10px; }

  /* ── Manage Profiles ── */
  .db-add-student-btn {
    background: #1565C0; color: #fff; border: none; border-radius: 20px;
    padding: 6px 14px; font-size: .82rem; font-weight: 700; cursor: pointer;
    -webkit-tap-highlight-color: transparent; white-space: nowrap;
  }
  .db-family-code-banner {
    background: #e8f5e9; border-radius: 8px; padding: 8px 12px;
    font-size: .8rem; color: #2e7d32; margin-bottom: 10px;
  }
  .db-family-code-val  { font-family: monospace; letter-spacing: 1px; margin: 0 4px; }
  .db-family-code-hint { color: #66bb6a; }
  .db-profiles-list    { display: flex; flex-direction: column; gap: 8px; }
  .db-profile-row      { display: flex; align-items: center; gap: 10px; }
  .db-profile-avatar   { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
  .db-profile-info     { flex:1; min-width:0; }
  .db-profile-name     { font-weight:700; font-size:.88rem; color:#263238; }
  .db-profile-age      { font-weight:400; color:#90a4ae; font-size:.75rem; }
  .db-profile-btns     { display:flex; gap:6px; flex-shrink:0; }
  .db-profile-edit-btn { background:#e3f2fd; border:none; border-radius:12px; color:#1565C0; font-size:.78rem; font-weight:700; padding:5px 10px; cursor:pointer; }
  .db-profile-pin-btn  { background:#f3e5f5; border:none; border-radius:12px; color:#7b1fa2; font-size:.78rem; font-weight:700; padding:5px 10px; cursor:pointer; }

  /* ── Student name bar ── */
  .db-student-name-bar  { display:flex; align-items:center; gap:10px; padding:4px 0 2px; }
  .db-student-name-emoji{ font-size:1.6rem; line-height:1; }
  .db-student-name      { font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:1.5rem; color:#1565C0; margin:0; }

  /* ── Slide-up sheet shared helpers ── */
  .db-sheet-label { font-size:.8rem; font-weight:700; color:#546e7a; display:block; margin:0 0 6px; }
  .db-sheet-inp   { width:100%; box-sizing:border-box; padding:10px; border:1.5px solid #cfd8dc; border-radius:10px; font-size:.95rem; margin-bottom:12px; font-family:inherit; }
  .db-sheet-msg   { font-size:.78rem; color:#e74c3c; text-align:center; min-height:1.1rem; margin-bottom:10px; }
  .db-sheet-save-btn {
    width:100%; padding:12px; border-radius:50px; border:none;
    background:#1565C0; color:#fff; font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif;
    font-size:1rem; cursor:pointer;
  }
  .db-sheet-save-btn:disabled { cursor:not-allowed; }

  /* ── Avatar picker ── */
  .db-avatar-row { display:flex; gap:10px; flex-wrap:wrap; justify-content:center; margin-bottom:14px; }
  .db-avatar-btn {
    width:46px; height:46px; border-radius:50%; border:3px solid transparent;
    display:flex; align-items:center; justify-content:center; font-size:1.3rem;
    cursor:pointer; box-sizing:border-box; transition:border-color .15s;
  }
  .db-avatar-btn.selected { border-color:#1565C0; }

  /* ── PIN dots and grid ── */
  .db-pin-dots  { display:flex; gap:10px; justify-content:center; margin:0 0 10px; }
  .db-pin-dot   { width:14px; height:14px; border-radius:50%; background:rgba(0,0,0,.12); border:1.5px solid rgba(0,0,0,.18); }
  .db-pin-dot.filled { background:#1565C0; border-color:#1565C0; box-shadow:0 0 6px rgba(21,101,192,.5); }
  .db-pin-grid  { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:14px; }

  /* ── AI sticky footer ── */
  .db-ai-footer-wrap {
    position: sticky;
    bottom: 0;
    z-index: 100;
    background: #fff;
    border-top: 1px solid #e0e0e0;
    padding: 12px 16px calc(12px + env(safe-area-inset-bottom));
    text-align: center;
    max-width: 600px;
    margin: 0 auto;
    width: 100%;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    box-sizing: border-box;
  }
  .db-ai-gen-btn {
    background: linear-gradient(135deg,#1565C0,#0d47a1);
    color: #fff; border: none; border-radius: 50px;
    padding: 12px 28px; font-size: .95rem;
    font-family: 'Boogaloo', 'Arial Rounded MT Bold', system-ui, sans-serif;
    cursor: pointer; box-shadow: 0 4px 12px rgba(21,101,192,.3);
    display: inline-flex; align-items: center; gap: 6px;
  }
  .db-ai-gen-btn:disabled { opacity: .45; cursor: not-allowed; box-shadow: none; }
  .db-ai-powered { font-size: .72rem; color: #90a4ae; margin-top: 5px; }
  .db-ai-footer-btns { display: flex; gap: 10px; justify-content: center; }
  .db-ai-back-btn {
    background: #f5f5f5; border: none; border-radius: 50px;
    padding: 10px 20px; font-size: .88rem; cursor: pointer; color: #546e7a;
    font-family: inherit;
  }
  .db-ai-pdf-btn {
    background: linear-gradient(135deg,#2e7d32,#1b5e20);
    color: #fff; border: none; border-radius: 50px;
    padding: 10px 20px; font-size: .88rem; cursor: pointer;
    font-family: inherit;
  }
  /* ── AI report sections (full-body view) ── */
  .db-ai-sections { display: flex; flex-direction: column; gap: 14px; padding: 4px 0 16px; }
  .db-ai-section  { background: rgba(0,0,0,.025); border-radius: 0 12px 12px 0; padding: 12px 14px; }
  .db-ai-section-title { font-size: .95rem; font-weight: 700; margin-bottom: 6px; }
  .db-ai-section-body  { font-size: .88rem; color: #546e7a; line-height: 1.7; }
  /* ── AI loading state ── */
  .db-ai-loading     { text-align: center; padding: 52px 20px; }
  .db-ai-loading-txt { font-size: .95rem; color: #546e7a; margin-top: 20px; }
  .db-ai-loading-sub { font-size: .78rem; color: #90a4ae; margin-top: 6px; }
  .db-ai-loading .db-ai-spinner {
    width:40px; height:40px; border-width:4px;
    border-color:#e3f2fd; border-top-color:#1565C0;
    display:block; margin:0 auto;
  }

  .db-empty {
    font-size: .9rem; color: #90a4ae; text-align: center; padding: 8px 0; margin: 0;
  }
  .db-last-active { font-size:.78rem; color:#90a4ae; text-align:right; margin-top:8px; }

  /* ── Weekly Snapshot ── */
  .ws-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; }
  .ws-widget {
    background:rgba(0,0,0,.03); border-radius:16px; padding:14px 10px;
    text-align:center; display:flex; flex-direction:column; align-items:center;
  }
  .ws-widget-icon { font-size:1.3rem; line-height:1; margin-bottom:4px; }
  .ws-widget-val  { font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:1.4rem; color:#263238; line-height:1.1; }
  .ws-widget-lbl  { font-size:.7rem; color:#90a4ae; margin-top:4px; }
  .ws-streak-row  { display:flex; justify-content:center; gap:3px; margin:4px 0 2px; }
  .ws-dot         { width:10px; height:10px; border-radius:50%; background:#e0e0e0; }
  .ws-dot-lit     { background:#f57f17; }
  .ws-streak-more { font-size:.72rem; color:#f57f17; font-weight:700; align-self:center; }

  /* ── Root System ── */
  .rs-legend { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:8px; }
  .rs-leg-item { display:flex; align-items:center; gap:5px; font-size:.75rem; color:#546e7a; }
  .rs-leg-dot  { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
  .rs-summary  { font-size:.8rem; color:#90a4ae; margin-bottom:14px; }
  .rs-track    { display:flex; flex-direction:column; align-items:center; }
  .rs-row      { display:flex; align-items:flex-start; width:100%; gap:10px; }
  .rs-row-right .rs-label { text-align:left; }
  .rs-row-left  .rs-label { text-align:right; }
  .rs-node-col  { display:flex; flex-direction:column; align-items:center; flex-shrink:0; }
  .rs-node      { width:52px; height:52px; border-radius:50%; border:3px solid; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:0; flex-shrink:0; }
  .rs-node-locked { opacity:.55; }
  .rs-node-num  { font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:.75rem; line-height:1; }
  .rs-node-icon { font-size:.9rem; line-height:1; }
  .rs-spine     { width:3px; height:24px; background:#e0e0e0; border-radius:2px; }
  .rs-label     { flex:1; padding-top:6px; min-width:0; }
  .rs-lbl-name  { font-size:.82rem; font-weight:700; color:#37474f; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
  .rs-lbl-sub   { font-size:.72rem; margin-top:2px; }

  /* ── Overview stat grid ── */
  .db-stat-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .db-stat-card { border-radius:14px; padding:14px 8px; text-align:center; }
  .db-stat-val  { font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:1.6rem; line-height:1.1; }
  .db-stat-lbl  { font-size:.75rem; opacity:.85; margin-top:3px; }
  @media (min-width:480px) { .db-stat-grid { grid-template-columns:repeat(4,1fr); } }

  /* ── Time ── */
  .db-time-box { background:rgba(103,58,183,.06); border-radius:14px; padding:14px 16px; display:flex; flex-direction:column; gap:10px; }
  .db-time-row { display:flex; justify-content:space-between; align-items:center; }
  .db-time-lbl { font-size:.88rem; color:#546e7a; }
  .db-time-val { font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:.95rem; color:#673ab7; }
  .db-time-sep { height:1px; background:rgba(0,0,0,.07); }

  /* ── Recent Quizzes ── */
  .db-quiz-list { display:flex; flex-direction:column; gap:6px; }
  .db-quiz-row  {
    display:flex; align-items:center; gap:10px; background:rgba(0,0,0,.03);
    border-radius:10px; padding:8px 10px; cursor:pointer; transition:background .15s;
    border:none; width:100%; text-align:left;
  }
  .db-quiz-row:hover { background:rgba(0,0,0,.07); }
  .db-quiz-bar   { width:6px; height:36px; border-radius:3px; flex-shrink:0; }
  .db-quiz-info  { flex:1; min-width:0; }
  .db-quiz-label { font-size:.88rem; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:#37474f; }
  .db-quiz-sub   { font-size:.75rem; color:#90a4ae; margin-top:2px; }
  .db-quiz-score { text-align:right; flex-shrink:0; font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:1rem; }
  .db-quiz-frac  { font-family:-apple-system,sans-serif; font-size:.72rem; color:#90a4ae; }

  /* ── Skills ── */
  .db-skill-row  { margin-bottom:12px; }
  .db-skill-top  { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .db-skill-name { font-size:.9rem; font-weight:600; }
  .db-skill-badge{ font-size:.75rem; font-weight:700; }
  .db-bar-bg     { height:9px; background:rgba(0,0,0,.08); border-radius:5px; overflow:hidden; }
  .db-bar-fill   { height:100%; border-radius:5px; transition:width .4s ease; }
  .db-skill-sub  { font-size:.75rem; color:#90a4ae; margin-top:3px; }

  /* ── Weak Areas ── */
  .db-weak-item { display:flex; justify-content:space-between; align-items:center; background:#fff3e0; border-left:3px solid #e65100; border-radius:0 10px 10px 0; padding:8px 12px; margin-bottom:6px; }
  .db-weak-name { font-size:.9rem; font-weight:600; color:#37474f; }
  .db-weak-pct  { font-size:.78rem; color:#e65100; }

  /* ── Practice ── */
  .db-practice-list { display:flex; flex-direction:column; gap:6px; }
  .db-practice-item { background:#fff3e0; border-left:3px solid #e65100; border-radius:0 10px 10px 0; padding:8px 10px; }
  .db-practice-txt  { font-size:.88rem; color:#37474f; margin-bottom:3px; }
  .db-practice-sub  { font-size:.75rem; color:#e65100; }

  /* ── Review Queue ── */
  .db-badge { display:inline-block; font-size:.72rem; font-weight:700; border-radius:6px; padding:2px 8px; margin-right:4px; }
  .db-badge-red  { background:#fce4ec; color:#c62828; }
  .db-badge-blue { background:#e3f2fd; color:#1565C0; }
  .db-review-summary { margin-bottom:10px; }
  .db-review-item { background:rgba(0,0,0,.03); border-radius:10px; padding:8px 12px; margin-bottom:6px; }
  .db-review-txt  { font-size:.88rem; color:#37474f; margin:4px 0 2px; }
  .db-review-acc  { font-size:.75rem; color:#90a4ae; }

  /* ── Activity Chart ── */
  .db-act-chart { display:flex; align-items:flex-end; gap:6px; height:90px; padding-top:4px; }
  .db-act-col   { flex:1; display:flex; flex-direction:column; align-items:center; height:100%; }
  .db-act-bar-wrap { flex:1; width:100%; display:flex; align-items:flex-end; }
  .db-act-bar   { width:80%; min-height:3px; border-radius:3px 3px 0 0; transition:height .3s; }
  .db-act-n     { font-size:9px; color:#546e7a; line-height:1.3; min-height:12px; }
  .db-act-day   { font-size:9px; color:#90a4ae; }

  .db-ai-spinner { display:inline-block; width:.85rem; height:.85rem; border:2px solid rgba(255,255,255,.4); border-top-color:#fff; border-radius:50%; animation:db-spin .8s linear infinite; vertical-align:middle; }
  @keyframes db-spin { to { transform:rotate(360deg); } }

  /* ── Shared controls ── */
  .db-ctrl-msg  { font-size:.82rem; min-height:1.2rem; margin:6px 0; text-align:center; }
  .db-ctrl-btns { display:flex; flex-wrap:wrap; gap:8px; margin-top:8px; }
  .db-ctrl-save {
    flex:1; background:linear-gradient(135deg,#1565C0,#0d47a1); color:#fff; border:none;
    border-radius:12px; padding:10px 16px; font-size:.9rem; font-weight:700; cursor:pointer;
    box-shadow:0 3px 0 rgba(0,0,0,.15); min-width:120px;
  }
  .db-ctrl-save:disabled { opacity:.6; cursor:not-allowed; }
  .db-ctrl-relock { background:#e3f2fd; color:#1565C0; border:none; border-radius:12px; padding:10px 14px; font-size:.85rem; font-weight:600; cursor:pointer; }
  .db-ctrl-reset  { background:#fce4ec; color:#c62828; border:none; border-radius:12px; padding:10px 14px; font-size:.85rem; font-weight:600; cursor:pointer; }

  /* ── Toggle button ── */
  .db-toggle-row { display:flex; justify-content:space-between; align-items:center; padding:10px 0; border-bottom:1px solid #f0f0f0; }
  .db-toggle-row:last-of-type { border-bottom:none; }
  .db-toggle-sub { font-size:.75rem; color:#90a4ae; }
  .db-toggle-btn { background:#cfd8dc; color:#fff; border:none; border-radius:20px; padding:6px 14px; font-size:.8rem; font-weight:700; cursor:pointer; min-width:48px; transition:background .15s; }
  .db-toggle-btn.db-toggle-on { background:#43a047; }
  .db-toggle-sm  { padding:4px 10px; font-size:.72rem; }

  /* ── Unit card grid ── */
  .db-unit-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; margin:10px 0; }
  .db-unit-card { background:#f5f5f5; border-radius:12px; padding:10px; border:2px solid transparent; }
  .db-unit-card.db-unit-unlocked { background:#e8f5e9; border-color:#a5d6a7; }
  .db-unit-card-top { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }
  .db-unit-num  { font-size:.72rem; color:#90a4ae; font-weight:700; text-transform:uppercase; }
  .db-unit-name { font-size:.82rem; font-weight:600; color:#37474f; margin-bottom:6px; }
  .db-unit-lessons-link { background:none; border:none; font-size:.75rem; color:#1565C0; text-decoration:underline; cursor:pointer; padding:0; }
  .db-lesson-drawer { background:#fff; border:1px solid #e0e0e0; border-radius:0 0 12px 12px; padding:8px 12px; margin-top:-4px; }
  .db-lesson-row { display:flex; justify-content:space-between; align-items:center; padding:6px 0; border-bottom:1px solid #f5f5f5; }
  .db-lesson-row:last-child { border-bottom:none; }
  .db-lesson-name { font-size:.82rem; color:#37474f; }
  .db-enrich-star { font-size:.75rem; margin-left:4px; vertical-align:middle; }

  /* ── Timer ── */
  .db-timer-row { display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px solid #f0f0f0; }
  .db-timer-lbl { font-size:.85rem; font-weight:600; color:#37474f; }
  .db-timer-adj { display:flex; align-items:center; gap:10px; }
  .db-timer-val { font-size:.9rem; font-weight:700; color:#1565C0; min-width:60px; text-align:center; }
  .db-adj-btn   { background:#e3f2fd; color:#1565C0; border:none; border-radius:50%; width:28px; height:28px; font-size:1rem; font-weight:700; cursor:pointer; }

  /* ── Form inputs ── */
  .db-form-row { margin-bottom:10px; }
  .db-form-lbl { display:block; font-size:.78rem; color:#546e7a; margin-bottom:4px; font-weight:600; }
  .db-form-inp { width:100%; padding:10px 12px; border:1px solid #cfd8dc; border-radius:10px; font-size:.9rem; background:#f8f9fa; color:#263238; box-sizing:border-box; }

  /* ── Feedback ── */
  .db-fb-stars { display:flex; gap:6px; justify-content:center; margin-bottom:10px; }
  .db-fb-star  { background:none; border:none; font-size:1.6rem; cursor:pointer; padding:0; color:#f1c40f; }
  .db-fb-cats  { display:flex; flex-wrap:wrap; gap:7px; justify-content:center; margin-bottom:10px; }
  .db-fb-cat   { background:#f0f4f8; border:1px solid #cfd8dc; border-radius:20px; padding:5px 12px; font-size:.78rem; cursor:pointer; color:#37474f; }
  .db-fb-cat.active { background:#e3f2fd; border-color:#1565C0; color:#1565C0; font-weight:700; }
  .db-fb-comment { width:100%; box-sizing:border-box; padding:10px 12px; border:1px solid #cfd8dc; border-radius:10px; font-size:.85rem; resize:vertical; background:#f8f9fa; color:#263238; font-family:inherit; }

  /* ── Changelog ── */
  .mb-14 { margin-bottom:14px; }
  .cl-version-brand { font-weight:800; font-size:.82rem; color:#1565C0; margin-bottom:4px; }
  .cl-version       { font-weight:700; font-size:.78rem; color:#546e7a; margin-bottom:4px; }
  .list-body        { padding-left:16px; margin:0; }
  .list-body li     { font-size:.78rem; color:#37474f; line-height:1.5; margin-bottom:4px; }

  /* ── Manage Profiles ── */
  .db-profiles-list { border-radius:14px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.07); background:#fff; }
  .db-profile-row  { display:flex; align-items:center; gap:10px; padding:12px 14px; border-bottom:1px solid #f0f0f0; }
  .db-profile-row:last-child { border-bottom:none; }
  .db-profile-avatar { width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.1rem; flex-shrink:0; }
  .db-profile-info { flex:1; min-width:0; }
  .db-profile-name { font-weight:700; font-size:.88rem; color:#263238; }
  .db-profile-age  { font-weight:400; color:#90a4ae; font-size:.75rem; margin-left:4px; }
  .db-profile-btns { display:flex; gap:6px; flex-shrink:0; }
  .db-profile-pin-btn { background:#fff3e0; border:none; border-radius:8px; padding:5px 8px; font-size:.7rem; cursor:pointer; color:#e65100; font-weight:600; }

  /* ── Quiz Review Modal ── */
  .db-review-modal { display:none; position:fixed; inset:0; z-index:200; background:rgba(0,0,0,.45); align-items:flex-end; }
  .db-review-modal.open { display:flex; }
  .db-review-sheet { width:100%; max-height:90vh; background:#fff; border-radius:20px 20px 0 0; display:flex; flex-direction:column; box-shadow:0 -8px 32px rgba(0,0,0,.18); animation:db-slide-up .25s cubic-bezier(.4,0,.2,1); }
  @keyframes db-slide-up { from { transform:translateY(100%); } to { transform:translateY(0); } }
  .db-review-head  { padding:16px 16px 12px; border-bottom:1px solid #e0e0e0; position:relative; flex-shrink:0; }
  .db-review-close { position:absolute; right:14px; top:14px; background:#f5f5f5; border:none; border-radius:50%; width:32px; height:32px; font-size:1rem; cursor:pointer; color:#546e7a; }
  .db-review-title { font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:1.1rem; color:#263238; margin-right:40px; }
  .db-review-meta  { font-size:.78rem; color:#90a4ae; margin-top:3px; }
  .db-review-score { font-family:'Boogaloo','Arial Rounded MT Bold',system-ui,sans-serif; font-size:1.4rem; margin-top:6px; }
  .db-review-frac  { font-family:-apple-system,sans-serif; font-size:.85rem; color:#90a4ae; }
  .db-review-body  { overflow-y:auto; padding:12px 16px 32px; flex:1; }
  .db-rev-sec  { font-weight:700; font-size:.88rem; margin:10px 0 6px; }
  .db-rev-item { background:rgba(0,0,0,.03); border-radius:10px; padding:10px 12px; margin-bottom:6px; }
  .db-rev-wrong { border-left:3px solid #c62828; }
  .db-rev-right { border-left:3px solid #2e7d32; }
  .db-rev-q    { font-size:.9rem; font-weight:600; color:#263238; margin-bottom:4px; }
  .db-rev-your { font-size:.8rem; color:#546e7a; margin-bottom:2px; }
  .db-rev-correct { font-size:.8rem; color:#546e7a; margin-bottom:2px; }
  .db-rev-time { font-size:.75rem; color:#90a4ae; margin-top:2px; }
  .db-rev-empty { font-size:.88rem; color:#90a4ae; text-align:center; padding:20px 0; }

  /* ── PIN keypad ── */
  .db-pin-key { background:#f0f4f8; border:1px solid #e0e0e0; border-radius:10px; padding:10px 0; font-size:1.1rem; font-weight:700; color:#263238; cursor:pointer; text-align:center; }
  .db-pin-key:active { background:#e3f2fd; }
  .db-pin-key-back { background:#fce4ec; border-color:#ffcdd2; color:#c62828; }
</style>

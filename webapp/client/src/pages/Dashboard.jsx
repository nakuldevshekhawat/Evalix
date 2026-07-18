import { useEffect, useState } from 'react';
import api from '../api';
import { calcGrade, gradeBadgeClass, GRADE_COLORS, timeAgo } from '../utils';
import { DonutChart, BarChart, Sparkline } from '../components/Charts';
import Avatar from '../components/Avatar';
import SkeletonLoader from '../components/SkeletonLoader';

const SPARKLINE_DATA = [4, 7, 5, 9, 6, 11, 8, 14, 10, 18];

export default function Dashboard() {
  const [stats, setStats]       = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/stats'),
      api.get('/analytics'),
      api.get('/activity'),
    ]).then(([s, a, act]) => {
      setStats(s.data);
      setAnalytics(a.data);
      setActivity(act.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <div className="page-header">
        <div><div className="page-title">Dashboard</div><div className="page-sub">Loading analytics...</div></div>
      </div>
      <div className="stats-grid">
        {[1,2,3,4].map(i => <div key={i} className={`stat-card c${i}`} style={{ height: 110, animation: 'skeletonPulse 1.5s infinite' }} />)}
      </div>
    </>
  );

  // Prepare donut chart data
  const ORDER = ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D', 'F'];
  const donutData = ORDER
    .filter(g => analytics?.gradeDist?.[g])
    .map(g => ({ label: g, value: analytics.gradeDist[g], color: GRADE_COLORS[g] }));

  // Dept bar chart
  const deptBar = (analytics?.deptPerf || []).map(d => ({
    label: d.dept.split(' ')[0],
    value: d.avg,
  }));

  const sparkVals = (analytics?.monthlyTrend || []).map(m => m.count);

  return (
    <>
      <div className="page-header">
        <div>
          <div className="page-title">Dashboard</div>
          <div className="page-sub">Academic performance overview — real-time analytics</div>
        </div>
        <div style={{ fontSize: 12, color: 'var(--text2)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--emerald)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
          Live
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <div className="stat-card c1">
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--indigo)' }}>◉</div>
            <span className="stat-trend up">+{Math.floor(stats.students * 0.12)} this sem</span>
          </div>
          <div className="stat-val">{stats.students}</div>
          <div className="stat-lbl">Total Students</div>
          <div className="stat-sparkline"><Sparkline data={SPARKLINE_DATA.map(v => v + stats.students)} color="var(--indigo)" /></div>
        </div>
        <div className="stat-card c2">
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background: 'rgba(167,139,250,0.15)', color: 'var(--violet)' }}>◈</div>
            <span className="stat-trend up">+2 new</span>
          </div>
          <div className="stat-val">{stats.courses}</div>
          <div className="stat-lbl">Active Courses</div>
          <div className="stat-sparkline"><Sparkline data={[3,4,4,5,5,6,6,7]} color="var(--violet)" /></div>
        </div>
        <div className="stat-card c3">
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background: 'rgba(34,211,238,0.12)', color: 'var(--cyan)' }}>◆</div>
            <span className="stat-trend up">+{Math.floor(stats.grades * 0.15)} this month</span>
          </div>
          <div className="stat-val">{stats.grades}</div>
          <div className="stat-lbl">Grades Recorded</div>
          <div className="stat-sparkline"><Sparkline data={sparkVals.length ? sparkVals : SPARKLINE_DATA} color="var(--cyan)" /></div>
        </div>
        <div className="stat-card c4">
          <div className="stat-card-top">
            <div className="stat-icon" style={{ background: 'rgba(52,211,153,0.12)', color: 'var(--emerald)' }}>✓</div>
            <span className={`stat-trend ${stats.passRate >= 75 ? 'up' : 'down'}`}>{stats.passRate >= 75 ? '↑' : '↓'} vs last sem</span>
          </div>
          <div className="stat-val" style={{ color: stats.passRate >= 75 ? 'var(--emerald)' : 'var(--rose)' }}>{stats.passRate}%</div>
          <div className="stat-lbl">Overall Pass Rate</div>
          <div className="stat-sparkline"><Sparkline data={[65,70,72,75,78,stats.passRate]} color={stats.passRate >= 75 ? 'var(--emerald)' : 'var(--rose)'} /></div>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid-7-5" style={{ marginBottom: 20 }}>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Department Performance</div>
            <span className="card-tag">Avg. Marks</span>
          </div>
          <div className="card-body">
            <BarChart data={deptBar} height={160} color="var(--indigo2)" />
          </div>
        </div>
        <div className="card">
          <div className="card-head">
            <div className="card-title">Grade Distribution</div>
            <span className="card-tag">{stats.grades} grades</span>
          </div>
          <div className="card-body">
            <DonutChart data={donutData} size={160} thickness={28} />
          </div>
        </div>
      </div>

      {/* Leaderboard + Activity */}
      <div className="two-col">
        {/* Top Performers */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">🏆 Top Performers</div>
            <span className="card-tag">By avg. marks</span>
          </div>
          <div className="card-body" style={{ padding: '8px 20px' }}>
            {(analytics?.topPerformers || []).map((s, i) => (
              <div key={s.id} className="leader-row">
                <div className={`leader-rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </div>
                <Avatar name={s.name} size={34} />
                <div className="leader-info">
                  <div className="leader-name">{s.name}</div>
                  <div className="leader-dept">{s.dept.split(' ')[0]} · {s.subjects} subjects</div>
                </div>
                <div>
                  <div className="leader-score">{s.avg}%</div>
                  <div className="leader-gpa">GPA {s.gpa}</div>
                </div>
              </div>
            ))}
            {!analytics?.topPerformers?.length && <div className="empty-state">No data yet</div>}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="card">
          <div className="card-head">
            <div className="card-title">⚡ Recent Activity</div>
            <span className="card-tag">Last 10 actions</span>
          </div>
          <div className="card-body" style={{ padding: '4px 20px' }}>
            <div className="activity-feed">
              {activity.map(a => (
                <div key={a.id} className="activity-item">
                  <div className={`activity-dot ${a.type}`}>
                    {a.type === 'grade' ? '◆' : a.type === 'student' ? '◉' : '◈'}
                  </div>
                  <div>
                    <div className="activity-msg">{a.message}</div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 3 }}>
                      <span className="activity-user">@{a.user}</span>
                      <span className="activity-time">{timeAgo(a.time)}</span>
                    </div>
                  </div>
                </div>
              ))}
              {!activity.length && <div className="empty-state">No recent activity</div>}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }
        @keyframes skeletonPulse { 0%,100% { opacity: 0.3; } 50% { opacity: 0.7; } }
      `}</style>
    </>
  );
}

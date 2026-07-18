export function calcGrade(marks) {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 75) return 'B+';
  if (marks >= 65) return 'B';
  if (marks >= 55) return 'C+';
  if (marks >= 50) return 'C';
  if (marks >= 40) return 'D';
  return 'F';
}

export function gradeToGpa(grade) {
  const map = { 'A+': 10, 'A': 9, 'B+': 8, 'B': 7, 'C+': 6, 'C': 5, 'D': 4, 'F': 0 };
  return map[grade] ?? 0;
}

export function calcGpa(grades) {
  if (!grades.length) return 0;
  const total = grades.reduce((a, g) => a + gradeToGpa(calcGrade(g.marks)), 0);
  return Math.round((total / grades.length) * 100) / 100;
}

export function gradeBadgeClass(grade) {
  if (!grade) return 'badge';
  if (grade === 'F')           return 'badge badge-rose';
  if (grade === 'D')           return 'badge badge-amber';
  if (grade === 'A+')          return 'badge badge-emerald';
  if (grade.includes('+'))     return 'badge badge-cyan';
  if (grade === 'A')           return 'badge badge-indigo';
  return 'badge badge-violet';
}

export function marksColor(marks) {
  if (marks >= 85) return 'var(--emerald)';
  if (marks >= 70) return 'var(--indigo)';
  if (marks >= 55) return 'var(--amber)';
  if (marks >= 40) return 'var(--rose)';
  return '#ef4444';
}

export function timeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

export const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics', 'Physics', 'Chemistry'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

export const GRADE_COLORS = {
  'A+': '#34d399', 'A': '#818cf8', 'B+': '#22d3ee',
  'B': '#a78bfa', 'C+': '#fbbf24', 'C': '#f97316', 'D': '#fb923c', 'F': '#fb7185'
};

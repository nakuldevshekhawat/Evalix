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

export function gradeBadgeClass(grade) {
  if (grade === 'F') return 'badge badge-red';
  if (grade === 'D') return 'badge badge-yellow';
  if (grade.includes('+')) return 'badge badge-green';
  return 'badge badge-orange';
}

export const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil', 'Mathematics'];
export const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

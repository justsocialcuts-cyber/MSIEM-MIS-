
import { MarksBySubject, SubjectMarks } from '../types';

// Calculates totals for F1-F6 and the Grand Total
export const calculateSubjectTotals = (marks: Partial<SubjectMarks>) => {
  const F_keys: (keyof SubjectMarks)[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
  const totalF = F_keys.reduce((sum, key) => sum + Number(marks[key] || 0), 0);
  const grandTotal = totalF + Number(marks.CC || 0) + Number(marks.SA || 0);

  // Note: Total F max is 30. Grand Total max is 100.
  return { totalF, grandTotal };
};

// Default template for new student marks
export const getInitialMarks = (subjects: string[]): MarksBySubject => subjects.reduce((acc, subject) => {
  acc[subject] = { F1: 0, F2: 0, F3: 0, F4: 0, F5: 0, F6: 0, CC: 0, SA: 0 };
  return acc;
}, {} as MarksBySubject);

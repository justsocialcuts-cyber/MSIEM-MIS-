
import React from 'react';
import { Printer, Edit2, Trash2 } from 'lucide-react';
import { Student } from '../types';
import { calculateSubjectTotals } from '../lib/utils';

interface StudentTableProps {
  students: Student[];
  subjects: string[];
  onOpenResultSheet: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string, studentName: string) => void;
}

export const StudentTable: React.FC<StudentTableProps> = ({ students, subjects, onOpenResultSheet, onEditStudent, onDeleteStudent }) => {
  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-xl shadow-2xl overflow-x-auto">
      <h2 className="text-xl font-bold mb-4 text-white">Student Records ({students.length})</h2>
      <div className="min-w-[1000px]">
        <table className="w-full divide-y divide-gray-700">
          <thead className="bg-gray-700/50">
            <tr>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase">Roll No.</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase">Name</th>
              <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300 uppercase">Class</th>
              {subjects.map(s => (
                <th key={s} className="py-3 px-2 text-center text-sm font-semibold text-gray-300 uppercase">{s} (Total)</th>
              ))}
              <th className="py-3 px-4 text-center text-sm font-semibold text-red-400 uppercase">Overall %</th>
              <th className="py-3 px-4 text-center text-sm font-semibold text-gray-300 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {students.length === 0 ? (
              <tr>
                <td colSpan={subjects.length + 5} className="py-8 text-center text-gray-400 text-lg">
                  No student records found. Click "Add Student" to begin.
                </td>
              </tr>
            ) : (
              students.map((student) => {
                let overallTotal = 0;
                let maxPossible = subjects.length * 100;
                
                return (
                  <tr key={student.id} className="hover:bg-gray-700 transition duration-150">
                    <td className="py-3 px-4 text-sm font-medium text-sky-300">{student.rollNo}</td>
                    <td className="py-3 px-4 text-sm text-white">{student.name}</td>
                    <td className="py-3 px-4 text-sm text-gray-400">{student.class}</td>
                    
                    {subjects.map(s => {
                      const marks = student.marks[s] || {};
                      const { grandTotal } = calculateSubjectTotals(marks);
                      overallTotal += grandTotal;
                      return (
                        <td key={s} className="py-3 px-2 text-center text-sm text-green-300 font-mono">
                          {grandTotal}
                        </td>
                      );
                    })}
                    
                    <td className="py-3 px-4 text-center text-sm font-bold text-red-400">
                      {maxPossible > 0 ? (overallTotal / maxPossible * 100).toFixed(1) : 0}%
                    </td>
                    
                    <td className="py-3 px-4 flex space-x-2 justify-center">
                      <button onClick={() => onOpenResultSheet(student)} title="Generate Result Sheet" className="text-indigo-400 hover:text-indigo-300 p-1 rounded-full hover:bg-gray-600 transition"><Printer className="w-5 h-5" /></button>
                      <button onClick={() => onEditStudent(student)} title="Edit Marks" className="text-yellow-400 hover:text-yellow-300 p-1 rounded-full hover:bg-gray-600 transition"><Edit2 className="w-5 h-5" /></button>
                      <button onClick={() => onDeleteStudent(student.id, student.name)} title="Delete Record" className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-600 transition"><Trash2 className="w-5 h-5" /></button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

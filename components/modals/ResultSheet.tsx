
import React from 'react';
import { X, Printer } from 'lucide-react';
import { Student, SubjectMarks } from '../../types';
import { MAX_MARKS } from '../../constants';
import { calculateSubjectTotals } from '../../lib/utils';

interface ResultSheetProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  subjects: string[];
}

const InfoItem: React.FC<{ label: string; value: string | number; className?: string }> = ({ label, value, className = '' }) => (
  <p className={`text-sm text-gray-700 ${className}`}>
    <span className="font-semibold text-indigo-700">{label}:</span> <span className='font-medium'>{value}</span>
  </p>
);

export const ResultSheet: React.FC<ResultSheetProps> = ({ isOpen, onClose, student, subjects }) => {
  if (!isOpen || !student) return null;

  const schoolName = "The Gemini Academy";
  const reportDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const calculatedResults = subjects.map(subject => {
    // FIX: Provide a default SubjectMarks object to prevent errors if a student is missing marks for a subject.
    const marks = student.marks[subject] || { F1: 0, F2: 0, F3: 0, F4: 0, F5: 0, F6: 0, CC: 0, SA: 0 };
    const { totalF, grandTotal } = calculateSubjectTotals(marks);
    return { subject, marks, totalF, grandTotal };
  });

  const overallGrandTotal = calculatedResults.reduce((sum, r) => sum + r.grandTotal, 0);
  const totalPossibleMarks = calculatedResults.length * 100; 
  const overallPercentage = totalPossibleMarks > 0 ? ((overallGrandTotal / totalPossibleMarks) * 100).toFixed(2) : '0.00';
  const overallGrade = parseFloat(overallPercentage) >= 80 ? 'A+' : parseFloat(overallPercentage) >= 60 ? 'A' : parseFloat(overallPercentage) >= 40 ? 'B' : 'C';

  const handlePrint = () => {
    document.body.classList.add('print-mode-active');
    window.print();
    document.body.classList.remove('print-mode-active');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto print-mode">
      <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white text-black shadow-2xl my-6 rounded-lg">
        
        <div className="flex justify-end gap-3 mb-6 print:hidden">
          <button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center transition duration-200">
            <Printer className="w-5 h-5 mr-2" /> Print Sheet
          </button>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-200">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="text-center mb-8 border-b-4 border-double border-indigo-700 pb-4">
          <h1 className="text-4xl font-extrabold text-indigo-800">{schoolName}</h1>
          <h2 className="text-xl font-semibold text-gray-700 mt-2">Annual Result Sheet - Class {student.class}</h2>
          <p className="text-sm text-gray-500 mt-1">Date Generated: {reportDate}</p>
        </div>

        <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-8 p-4 bg-indigo-50/50 border border-indigo-200 rounded-lg">
          <InfoItem label="Student Name" value={student.name} />
          <InfoItem label="Father's Name" value={student.fatherName} />
          <InfoItem label="Roll No." value={student.rollNo} />
          <InfoItem label="Mother's Name" value={student.motherName} />
          <InfoItem label="Class" value={student.class} />
          <InfoItem label="Address" value={student.address} className="col-span-2" />
        </div>

        <h3 className="text-xl font-bold text-indigo-700 mb-4">Scholastic Area Performance</h3>
        <div className="overflow-x-auto border border-gray-300 rounded-lg shadow-md">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-indigo-100">
              <tr>
                <th rowSpan={2} className="py-3 px-4 text-left text-sm font-bold text-gray-700 uppercase border-r border-gray-300">Subject</th>
                <th colSpan={6} className="py-2 px-1 text-center text-sm font-bold text-gray-700 uppercase border-r border-gray-300">Formative (F) Marks</th>
                <th rowSpan={2} className="py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase border-r border-gray-300">Total F (Max 30)</th>
                <th rowSpan={2} className="py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase border-r border-gray-300">CC (Max {MAX_MARKS.CC})</th>
                <th rowSpan={2} className="py-3 px-4 text-center text-sm font-bold text-gray-700 uppercase border-r border-gray-300">SA (Max {MAX_MARKS.SA})</th>
                <th rowSpan={2} className="py-3 px-4 text-center text-sm font-bold text-red-600 uppercase">Grand Total (Max 100)</th>
              </tr>
              <tr className="bg-indigo-100/70">
                {['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map(f => <th key={f} className="py-2 px-1 text-center text-xs font-semibold text-gray-600 border-r border-gray-300">{f} (Max {MAX_MARKS[f as keyof typeof MAX_MARKS]})</th>)}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {calculatedResults.map((result, index) => (
                <tr key={index}>
                  <td className="py-2 px-4 whitespace-nowrap text-sm font-medium text-gray-800 border-r border-gray-200">{result.subject}</td>
                  {['F1', 'F2', 'F3', 'F4', 'F5', 'F6'].map(f => <td key={f} className="py-2 px-1 text-center text-sm text-gray-600 border-r border-gray-200">{result.marks[f as keyof SubjectMarks]}</td>)}
                  <td className="py-2 px-4 text-center text-sm font-bold text-indigo-600 border-r border-gray-200">{result.totalF}</td>
                  <td className="py-2 px-4 text-center text-sm text-gray-600 border-r border-gray-200">{result.marks.CC}</td>
                  <td className="py-2 px-4 text-center text-sm text-gray-600 border-r border-gray-200">{result.marks.SA}</td>
                  <td className="py-2 px-4 text-center text-sm font-extrabold text-red-600">{result.grandTotal}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-8 p-6 bg-green-50 border-4 border-double border-green-300 rounded-xl shadow-lg flex justify-between items-center">
          <div>
            <p className="text-lg font-semibold text-gray-700">Overall Total: <span className="text-2xl font-extrabold text-green-700">{overallGrandTotal}</span> / {totalPossibleMarks}</p>
            <p className="text-lg font-semibold text-gray-700">Percentage: <span className="text-2xl font-extrabold text-green-700">{overallPercentage}%</span></p>
          </div>
          <div className='text-right'>
            <p className="text-xl font-bold text-gray-700">Grade:</p>
            <p className="text-5xl font-extrabold text-red-700 mt-1">{overallGrade}</p>
          </div>
        </div>
        
        <div className="mt-12 pt-4 border-t border-gray-300 flex justify-around text-sm text-gray-600">
            <div>Signature of Class Teacher</div>
            <div>Signature of Principal</div>
            <div>Signature of Parent</div>
        </div>

      </div>
    </div>
  );
};

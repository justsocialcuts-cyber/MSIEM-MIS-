
import React, { useState, useEffect, useMemo } from 'react';
// FIX: Use Firebase v8 compat types to resolve module errors.
import type { firestore } from 'firebase/compat/app';
import { ModalBase } from './ModalBase';
import { Student, SubjectMarks } from '../../types';
import { getInitialMarks } from '../../lib/utils';
import { MAX_MARKS, SCHOOL_CLASSES } from '../../constants';
import { getPrivateCollectionPath } from '../../hooks/useFirebase';

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Update Firestore type to match v8 compat.
  db: firestore.Firestore | null;
  userId: string | null;
  subjects: string[];
  studentToEdit: Student | null;
}

export const StudentModal: React.FC<StudentModalProps> = ({ isOpen, onClose, db, userId, subjects, studentToEdit }) => {
  const initialStudentState = useMemo((): Student => ({
    id: studentToEdit?.id || Date.now().toString(),
    rollNo: studentToEdit?.rollNo || '',
    name: studentToEdit?.name || '',
    fatherName: studentToEdit?.fatherName || '',
    motherName: studentToEdit?.motherName || '',
    address: studentToEdit?.address || '',
    class: studentToEdit?.class || '',
    marks: studentToEdit?.marks || getInitialMarks(subjects),
  }), [studentToEdit, subjects]);

  const [studentData, setStudentData] = useState<Student>(initialStudentState);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStudentData(initialStudentState);
  }, [initialStudentState, isOpen]);

  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
  };

  const handleMarkChange = (subject: string, markType: keyof SubjectMarks, value: string) => {
    const numericValue = value === '' ? '' : parseInt(value, 10);
    const maxMark = MAX_MARKS[markType] || 100;
    
    let finalValue: number | '' = numericValue;
    if (numericValue !== '') {
        finalValue = Math.max(0, numericValue);
        finalValue = Math.min(maxMark, finalValue);
    }

    setStudentData(prev => ({
      ...prev,
      marks: {
        ...prev.marks,
        [subject]: {
          ...prev.marks[subject],
          [markType]: finalValue
        }
      }
    }));
  };
  
  const F_keys: (keyof SubjectMarks)[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6'];
  const CC_SA_keys: (keyof SubjectMarks)[] = ['CC', 'SA'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !userId) return;

    if (!studentData.name || !studentData.rollNo || !studentData.class) {
        console.error('Validation failed: Please fill in Name, Roll No., and Class.');
        return;
    }

    setIsSaving(true);
    try {
      // FIX: Use Firebase v8 compat methods to get doc reference and set data.
      const studentDocRef = db.collection(getPrivateCollectionPath(userId, 'students')).doc(studentData.id);
      
      const sanitizedStudentData = { ...studentData };
      Object.keys(sanitizedStudentData.marks).forEach(subject => {
        Object.keys(sanitizedStudentData.marks[subject]).forEach(markType => {
            const key = markType as keyof SubjectMarks;
            if (sanitizedStudentData.marks[subject][key] === '') {
                sanitizedStudentData.marks[subject][key] = 0;
            }
        });
      });
      sanitizedStudentData.rollNo = Number(sanitizedStudentData.rollNo);

      await studentDocRef.set(sanitizedStudentData, { merge: true });
      onClose();
    } catch (error) {
      console.error("Error saving student data:", error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <ModalBase title={studentToEdit ? "Edit Student Marks" : "Add New Student"} onClose={onClose} wide={true}>
      <form onSubmit={handleSubmit}>
        <h3 className="text-lg font-semibold text-sky-400 mb-3 border-b border-gray-700 pb-1">Student Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {['rollNo', 'name', 'class', 'fatherName', 'motherName', 'address'].map((field) => (
            <div key={field}>
              <label htmlFor={field} className="block text-sm font-medium text-gray-300 capitalize">
                {field.replace(/([A-Z])/g, ' $1')}:
              </label>
              {field === 'class' ? (
                <select id={field} name={field} value={studentData[field as keyof Student] as string} onChange={handleDetailChange} required className="mt-1 block w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-sky-500 focus:border-sky-500">
                  <option value="" disabled>Select Class</option>
                  {SCHOOL_CLASSES.map(cls => <option key={cls} value={cls}>{cls}</option>)}
                </select>
              ) : (
                <input id={field} type={field === 'rollNo' ? 'number' : 'text'} name={field} value={studentData[field as keyof Student] as string} onChange={handleDetailChange} required={['rollNo', 'name', 'class'].includes(field)} className="mt-1 block w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white focus:ring-sky-500 focus:border-sky-500"/>
              )}
            </div>
          ))}
        </div>

        <h3 className="text-lg font-semibold text-sky-400 mb-3 border-b border-gray-700 pb-1">Marks Entry</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="py-2 px-3 text-left text-xs font-semibold text-gray-300 uppercase sticky left-0 bg-gray-700 z-10">Subject</th>
                {F_keys.map(k => <th key={k} className="py-2 px-1 text-center text-xs font-semibold text-gray-300 uppercase w-12">{k} (Max {MAX_MARKS[k]})</th>)}
                {CC_SA_keys.map(k => <th key={k} className="py-2 px-1 text-center text-xs font-semibold text-gray-300 uppercase w-12">{k} (Max {MAX_MARKS[k]})</th>)}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {subjects.map((subject) => {
                const marks = studentData.marks[subject] || {};
                return (
                  <tr key={subject} className="hover:bg-gray-800 transition duration-150">
                    <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-white sticky left-0 bg-gray-800/90 z-10">{subject}</td>
                    {[...F_keys, ...CC_SA_keys].map(markType => (
                      <td key={`${subject}-${markType}`} className="py-2 px-1">
                        <input type="number" min="0" max={MAX_MARKS[markType]} value={marks[markType] === 0 ? '' : marks[markType]} onChange={(e) => handleMarkChange(subject, markType, e.target.value)} className="w-full text-center p-1 rounded-md bg-gray-900 border border-gray-700 text-sm text-sky-300"/>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button type="submit" disabled={isSaving} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition duration-200 disabled:opacity-50 flex items-center">
            {isSaving ? 'Saving...' : (studentToEdit ? 'Update Record' : 'Add Student')}
          </button>
        </div>
      </form>
    </ModalBase>
  );
};

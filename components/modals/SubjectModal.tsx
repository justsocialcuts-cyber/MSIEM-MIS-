
import React, { useState, useCallback } from 'react';
// FIX: Use Firebase v8 compat types to resolve module errors.
import type { firestore } from 'firebase/compat/app';
import { Plus, Trash2 } from 'lucide-react';
import { ModalBase } from './ModalBase';
import { getPrivateCollectionPath } from '../../hooks/useFirebase';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Update Firestore type to match v8 compat.
  db: firestore.Firestore | null;
  userId: string | null;
  subjects: string[];
  setSubjects: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({ isOpen, onClose, db, userId, subjects, setSubjects }) => {
  const [newSubject, setNewSubject] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const saveSubjectsToFirestore = useCallback(async (newSubjectList: string[]) => {
    if (!db || !userId) return;
    setIsSaving(true);
    try {
      // FIX: Use Firebase v8 compat methods to get doc reference and set data.
      const configDocRef = db.collection(getPrivateCollectionPath(userId, 'config')).doc('subjects');
      await configDocRef.set({ subjectNames: newSubjectList }, { merge: false });
      setSubjects(newSubjectList);
    } catch (error) {
      console.error("Error saving subjects:", error);
    } finally {
      setIsSaving(false);
    }
  }, [db, userId, setSubjects]);

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSubject.trim();
    if (trimmed && !subjects.includes(trimmed)) {
      const newSubjects = [...subjects, trimmed];
      saveSubjectsToFirestore(newSubjects);
      setNewSubject('');
    }
  };

  const removeSubject = (subjectToRemove: string) => {
    const newSubjects = subjects.filter(s => s !== subjectToRemove);
    saveSubjectsToFirestore(newSubjects);
  };

  if (!isOpen) return null;

  return (
    <ModalBase title="Manage Subjects" onClose={onClose}>
      <p className="text-sm text-gray-400 mb-4">
        Customize the list of subjects. All new student entries will use this list.
      </p>

      <form onSubmit={addSubject} className="flex gap-2 mb-6">
        <input
          type="text"
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          placeholder="New Subject Name"
          className="flex-grow p-2 rounded-md bg-gray-700 text-white border border-gray-600 focus:ring-sky-500 focus:border-sky-500"
          required
        />
        <button
          type="submit"
          disabled={isSaving}
          className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : <Plus className="w-5 h-5" />}
        </button>
      </form>

      <div className="h-64 overflow-y-auto pr-2">
        <ul className="space-y-2">
          {subjects.map((subject, index) => (
            <li key={index} className="flex justify-between items-center bg-gray-700 p-3 rounded-lg shadow-inner">
              <span className="text-white text-sm font-medium">{subject}</span>
              <button
                onClick={() => removeSubject(subject)}
                className="text-red-400 hover:text-red-500 transition duration-150 p-1 rounded-full hover:bg-gray-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </ModalBase>
  );
};

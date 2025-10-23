
import React, { useState, useEffect } from 'react';
// FIX: Use Firebase v8 compat imports to resolve module errors.
// Note: methods are called on db/collection/doc objects directly now.
import { useFirebase, getPrivateCollectionPath } from './hooks/useFirebase';
import { Student } from './types';
import { defaultSubjects } from './constants';
import { exportToCsv } from './services/csvExporter';
import { SubjectModal } from './components/modals/SubjectModal';
import { StudentModal } from './components/modals/StudentModal';
import { ResultSheet } from './components/modals/ResultSheet';
import { Header } from './components/Header';
import { StudentTable } from './components/StudentTable';

const App: React.FC = () => {
  const { db, userId, loading } = useFirebase();
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<string[]>(defaultSubjects);

  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  const [isResultSheetOpen, setIsResultSheetOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  useEffect(() => {
    if (!db || !userId) return;

    // FIX: Use Firebase v8 compat methods.
    const configDocRef = db.collection(getPrivateCollectionPath(userId, 'config')).doc('subjects');
    const unsubscribeConfig = configDocRef.onSnapshot((docSnap) => {
      if (docSnap.exists && docSnap.data()?.subjectNames) {
        setSubjects(docSnap.data()?.subjectNames);
      } else {
        configDocRef.set({ subjectNames: defaultSubjects }, { merge: true });
      }
    }, (error) => console.error("Error listening to subjects config:", error));

    // FIX: Use Firebase v8 compat methods.
    const studentsColRef = db.collection(getPrivateCollectionPath(userId, 'students'));
    const studentsQuery = studentsColRef.orderBy('rollNo', 'asc');
    const unsubscribeStudents = studentsQuery.onSnapshot((snapshot) => {
      const studentList = snapshot.docs.map(doc => doc.data() as Student);
      setStudents(studentList);
    }, (error) => console.error("Error listening to students:", error));

    return () => {
      unsubscribeConfig();
      unsubscribeStudents();
    };
  }, [db, userId]);

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setIsStudentModalOpen(true);
  };

  const handleAddNewStudent = () => {
    setEditingStudent(null);
    setIsStudentModalOpen(true);
  };

  const handleOpenResultSheet = (student: Student) => {
    setSelectedStudent(student);
    setIsResultSheetOpen(true);
  };

  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!db || !userId) return;
    if (!window.confirm(`Are you sure you want to delete ${studentName}'s record? This cannot be undone.`)) {
      return;
    }
    try {
      // FIX: Use Firebase v8 compat methods.
      const studentDocRef = db.collection(getPrivateCollectionPath(userId, 'students')).doc(studentId);
      await studentDocRef.delete();
    } catch (error) {
      console.error("Error deleting student:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <p className="text-xl animate-pulse">Initializing Application...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white font-sans p-4 md:p-8">
       <style>{`
        .print-mode { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        @media print {
          body > #root > div { display: none; }
          .print-mode-active, .print-mode-active #root, .print-mode-active body { all: initial; }
          .print-mode { display: block !important; }
        }
      `}</style>
      
      <Header
        subjectCount={subjects.length}
        onOpenSubjectModal={() => setIsSubjectModalOpen(true)}
        onExportCsv={() => exportToCsv(students, subjects)}
        onAddNewStudent={handleAddNewStudent}
      />
      
      <p className="text-xs text-gray-500 mb-4 text-center md:text-left">
        Your data is securely stored privately. User ID: <span className="font-mono text-sky-400">{userId}</span>
      </p>

      <StudentTable
        students={students}
        subjects={subjects}
        onOpenResultSheet={handleOpenResultSheet}
        onEditStudent={handleEditStudent}
        onDeleteStudent={handleDeleteStudent}
      />

      <SubjectModal isOpen={isSubjectModalOpen} onClose={() => setIsSubjectModalOpen(false)} db={db} userId={userId} subjects={subjects} setSubjects={setSubjects} />
      <StudentModal isOpen={isStudentModalOpen} onClose={() => setIsStudentModalOpen(false)} db={db} userId={userId} subjects={subjects} studentToEdit={editingStudent} />
      <ResultSheet isOpen={isResultSheetOpen} onClose={() => setIsResultSheetOpen(false)} student={selectedStudent} subjects={subjects} />
    </div>
  );
};

export default App;

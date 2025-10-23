
import React from 'react';
import { Settings, Download, Plus } from 'lucide-react';

interface HeaderProps {
    subjectCount: number;
    onOpenSubjectModal: () => void;
    onExportCsv: () => void;
    onAddNewStudent: () => void;
}

export const Header: React.FC<HeaderProps> = ({ subjectCount, onOpenSubjectModal, onExportCsv, onAddNewStudent }) => {
    return (
        <header className="flex flex-col md:flex-row justify-between items-center mb-6 pb-4 border-b border-gray-700 gap-4">
            <h1 className="text-3xl font-extrabold text-sky-400 text-center md:text-left">Teacher's Mark Register</h1>
            <div className="flex items-center space-x-2 md:space-x-3">
                <button
                    onClick={onOpenSubjectModal}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center transition duration-200 shadow-lg shadow-sky-900/50"
                >
                    <Settings className="w-5 h-5 mr-2" /> Subjects ({subjectCount})
                </button>
                <button
                    onClick={onExportCsv}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center transition duration-200 shadow-lg shadow-indigo-900/50"
                >
                    <Download className="w-5 h-5 mr-2" /> Export
                </button>
                <button
                    onClick={onAddNewStudent}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-3 rounded-lg flex items-center transition duration-200 shadow-lg shadow-green-900/50"
                >
                    <Plus className="w-5 h-5 mr-2" /> Add Student
                </button>
            </div>
        </header>
    );
};

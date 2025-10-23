
import { Student } from '../types';
import { calculateSubjectTotals } from '../lib/utils';

export const exportToCsv = (students: Student[], subjects: string[]) => {
    if (students.length === 0) {
        alert("No student data to export.");
        return;
    }

    const marksKeys: string[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'CC', 'SA'];

    // 1. Build Header Row
    let header: string[] = [
        "Roll No.", "Name", "Class", "Father's Name", "Mother's Name", "Address"
    ];

    subjects.forEach(subject => {
        marksKeys.forEach(markKey => {
            header.push(`${subject} (${markKey})`);
        });
        header.push(`${subject} (Total)`); // Grand Total per subject
    });

    header.push("Overall Grand Total", "Overall Possible Marks", "Overall Percentage", "Overall Grade");

    const csvValue = (value: string | number | undefined) => `"${String(value ?? '').replace(/"/g, '""')}"`;

    let csvContent = header.map(h => csvValue(h)).join(',') + '\n';

    // 2. Build Data Rows
    students.forEach(student => {
        let row: (string | number)[] = [];
        const studentMarks = student.marks || {};
        
        row.push(
            csvValue(student.rollNo), 
            csvValue(student.name),
            csvValue(student.class), 
            csvValue(student.fatherName),
            csvValue(student.motherName),
            csvValue(student.address)
        );

        let overallTotal = 0;
        let totalPossibleMarks = 0;

        subjects.forEach(subject => {
            const marks = studentMarks[subject] || {};
            const { grandTotal } = calculateSubjectTotals(marks);
            
            marksKeys.forEach(markKey => {
                row.push((marks as any)[markKey] || 0);
            });
            
            row.push(grandTotal); 
            overallTotal += grandTotal;
            totalPossibleMarks += 100; // Each subject max is 100
        });

        const overallPercentage = totalPossibleMarks > 0 ? ((overallTotal / totalPossibleMarks) * 100).toFixed(2) : '0.00';
        const overallGrade = parseFloat(overallPercentage) >= 80 ? 'A+' : parseFloat(overallPercentage) >= 60 ? 'A' : parseFloat(overallPercentage) >= 40 ? 'B' : 'C';

        row.push(overallTotal, totalPossibleMarks, overallPercentage, csvValue(overallGrade));

        csvContent += row.join(',') + '\n';
    });

    // 3. Trigger Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `School_Marks_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url); 
};

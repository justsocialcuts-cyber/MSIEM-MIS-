
// Define the maximum marks for each assessment component
export const MAX_MARKS: { [key: string]: number } = {
  F1: 5, F2: 5, F3: 5, F4: 5, F5: 5, F6: 5, // Total F = 30
  CC: 20, // Co-curricular/Continuous Comprehensive
  SA: 50, // Summative Assessment
};

// Define the list of school classes
export const SCHOOL_CLASSES: string[] = [
  'NURSERY', 'LKG', 'UKG', 
  '1st', '2nd', '3rd', '4th', '5th', 
  '6th', '7th', '8th', '9th', '10th'
];

export const defaultSubjects: string[] = ['English', 'Math', 'Urdu', 'Science', 'Kashmiri', 'Islamic Studies', 'Computer'];

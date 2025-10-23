
export interface SubjectMarks {
  F1: number | '';
  F2: number | '';
  F3: number | '';
  F4: number | '';
  F5: number | '';
  F6: number | '';
  CC: number | '';
  SA: number | '';
}

export type MarksBySubject = {
  [subject: string]: SubjectMarks;
};

export interface Student {
  id: string;
  rollNo: number | '';
  name: string;
  fatherName: string;
  motherName: string;
  address: string;
  class: string;
  marks: MarksBySubject;
}

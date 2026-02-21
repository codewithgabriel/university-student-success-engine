
export enum RiskLevel {
  HIGH = 'High Risk',
  MODERATE = 'Moderate Risk',
  ON_TRACK = 'On Track'
}

export interface StudentRecord {
  studentId: string;
  faculty: string;
  department: string;
  level: number; // 100, 200, etc.
  courseId: string;
  attendanceRate: number;
  midtermGrade: number;
  finalGrade?: number;
  assignmentsAvg: number;
  lmsLogins: number;
}

export interface AnalysisResult {
  studentId: string;
  riskLevel: RiskLevel;
  rootCause: string;
  interventionStrategy: string;
  riskScore: number;
}

export interface Department {
  name: string;
  students: StudentRecord[];
}

export interface Faculty {
  name: string;
  departments: Department[];
}

export interface UniversityData {
  name: string;
  faculties: Faculty[];
}

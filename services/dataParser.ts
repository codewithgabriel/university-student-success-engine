
import { StudentRecord, UniversityData, Faculty, Department } from '../types';

const FACULTIES = [
  {
    name: "Faculty of Engineering",
    depts: ["Mechanical Engineering", "Software Engineering", "Civil Engineering", "Electrical Engineering"]
  },
  {
    name: "Faculty of Science",
    depts: ["Computer Science", "Mathematics", "Physics", "Biotechnology"]
  },
  {
    name: "Faculty of Business",
    depts: ["Accounting", "Economics", "Marketing", "Business Administration"]
  }
];

const COURSES: Record<string, string[]> = {
  "Software Engineering": ["SE101", "SE202", "SE303"],
  "Computer Science": ["CS101", "CS202", "CS303"],
  "Mechanical Engineering": ["ME101", "ME202"],
  "Mathematics": ["MTH101", "MTH202"],
  "Accounting": ["ACC101", "ACC202"]
};

const getRandom = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

export const generateUniversityData = (): UniversityData => {
  const university: UniversityData = {
    name: "Grand Nexus University",
    faculties: []
  };

  FACULTIES.forEach(fData => {
    const faculty: Faculty = { name: fData.name, departments: [] };

    fData.depts.forEach(dName => {
      const department: Department = { name: dName, students: [] };
      const studentCount = 500; // Requirement: 500 students per department
      const courses = COURSES[dName] || ["GEN101", "GEN202"];
      const year = new Date().getFullYear();

      for (let i = 1; i <= studentCount; i++) {
        const level = getRandom(1, 4) * 100;
        const deptCode = dName.split(' ').map(w => w[0]).join('').toUpperCase();
        const matricNo = `${year}-${deptCode}-${String(i).padStart(4, '0')}`;

        // Simulate realistic bell curve/at-risk distributions
        const isAtRisk = Math.random() > 0.85;

        department.students.push({
          studentId: matricNo,
          faculty: fData.name,
          department: dName,
          level: level,
          courseId: courses[getRandom(0, courses.length - 1)],
          attendanceRate: isAtRisk ? getRandom(10, 60) : getRandom(70, 100),
          midtermGrade: isAtRisk ? getRandom(20, 50) : getRandom(60, 95),
          assignmentsAvg: isAtRisk ? getRandom(30, 60) : getRandom(70, 100),
          lmsLogins: isAtRisk ? getRandom(0, 5) : getRandom(8, 50),
          finalGrade: undefined
        });
      }
      faculty.departments.push(department);
    });
    university.faculties.push(faculty);
  });

  return university;
};

export const exportToCSV = (analysis: any[]) => {
  if (analysis.length === 0) return;
  const headers = Object.keys(analysis[0]).join(",");
  const rows = analysis.map(row =>
    Object.values(row).map(value => `"${value}"`).join(",")
  );
  const csvContent = [headers, ...rows].join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `Intervention_Report_${new Date().toISOString()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

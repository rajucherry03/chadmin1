// Firestore path builders for dynamic department/year/section structures
// Department normalization keeps both a readable and a compact key

export const normalizeDepartmentKey = (departmentLabel) => {
  if (!departmentLabel) return "UNK";
  return departmentLabel.toString().replace(/[^A-Z0-9_]/gi, "_");
};

// Build key in section-year dash form: e.g., A-II
export const buildStudentsGroupKey = (year, section) => {
  const y = (year || "U").toString().toUpperCase();
  const s = (section || "U").toString().toUpperCase();
  return `${s}-${y}`;
};

// students/{department}/{year_section}
// department is expected to be a short code like CSE_DS
export const studentsCollectionPath = (department, year, section) => {
  const dept = normalizeDepartmentKey(department);
  const groupKey = buildStudentsGroupKey(year, section);
  return `students/${dept}/${groupKey}`;
};

// students/{department}/{year_section}/{studentId}
export const studentDocPath = (department, year, section, studentId) => {
  return `${studentsCollectionPath(department, year, section)}/${studentId}`;
};

// courses/{department}/years/{year}/sections/{section}/courseDetails
// department is expected to be a short code like CSE_DS for courses as well
export const coursesCollectionPath = (department, year, section) => {
  const dept = department;
  const y = (year || "").toString().toUpperCase();
  const s = (section || "").toString().toUpperCase();
  return `courses/${dept}/years/${y}/sections/${s}/courseDetails`;
};

export const courseDocPath = (department, year, section, courseId) => {
  return `${coursesCollectionPath(department, year, section)}/${courseId}`;
};



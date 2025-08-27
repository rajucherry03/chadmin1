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

// Variants helpers to support legacy structures
// Generate possible department identifiers, e.g., CSE_DS -> [CSE_DS, CSEDS]
export const getDepartmentVariants = (department) => {
  const variants = new Set();
  const normalized = normalizeDepartmentKey(department || "UNK");
  variants.add(normalized);
  // Compact form without underscores (e.g., CSE_DS -> CSEDS)
  const compact = normalized.replace(/_/g, "");
  if (compact) variants.add(compact);
  // If input is already compact, also add underscored
  if (department && /[A-Z0-9]+/i.test(department) && !department.includes("_")) {
    const underscored = department.replace(/([^_])([A-Z])/g, "$1_$2").toUpperCase();
    variants.add(normalizeDepartmentKey(underscored));
  }
  return Array.from(variants);
};

// Generate possible group key variants for students subcollections
// Default current: Section-Year (e.g., B-III), Legacy: Year-Section (e.g., III-B)
export const buildStudentsGroupKeyVariants = (year, section) => {
  const y = (year || "U").toString().toUpperCase();
  const s = (section || "U").toString().toUpperCase();
  return [
    `${s}-${y}`,
    `${y}-${s}`,
  ];
};

// List all plausible students collection paths to try for read operations
export const possibleStudentsCollectionPaths = (department, year, section) => {
  const deptVariants = getDepartmentVariants(department);
  const keyVariants = buildStudentsGroupKeyVariants(year, section);
  const paths = [];
  deptVariants.forEach((dept) => {
    keyVariants.forEach((key) => {
      paths.push(`students/${dept}/${key}`);
    });
  });
  return paths;
};



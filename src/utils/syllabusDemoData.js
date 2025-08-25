import { db } from '../firebase';
import { collection, addDoc, doc, setDoc, getDocs, deleteDoc } from 'firebase/firestore';

// Demo data for Syllabus Management System
export const populateDemoData = async () => {
  try {
    console.log('Starting to populate demo data...');

    // 1. Programs
    const programs = [
      {
        name: 'Bachelor of Technology in Computer Science',
        degree_type: 'UG',
        duration_years: 4,
        intake_code: 'BTECH-CSE-2024',
        effective_from: '2024-06-01',
        effective_to: '2028-05-31',
        description: 'Comprehensive computer science program with focus on software development and data science',
        total_credits: 160,
        max_students: 120,
        department: 'Computer Science & Engineering',
        coordinator: 'Dr. John Smith',
        status: 'active'
      },
      {
        name: 'Master of Technology in Data Science',
        degree_type: 'PG',
        duration_years: 2,
        intake_code: 'MTECH-DS-2024',
        effective_from: '2024-06-01',
        effective_to: '2026-05-31',
        description: 'Advanced program in data science and machine learning',
        total_credits: 80,
        max_students: 60,
        department: 'Computer Science & Engineering',
        coordinator: 'Dr. Sarah Johnson',
        status: 'active'
      }
    ];

    console.log('Adding programs...');
    for (const program of programs) {
      await addDoc(collection(db, 'programs'), {
        ...program,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'demo_user',
        total_students: 0,
        total_courses: 0
      });
    }

    // 2. Semesters
    const semesters = [
      {
        program_id: 'BTECH-CSE-2024',
        sem_no: 1,
        start_date: '2024-08-01',
        end_date: '2024-12-15',
        academic_year: '2024-25'
      },
      {
        program_id: 'BTECH-CSE-2024',
        sem_no: 2,
        start_date: '2025-01-15',
        end_date: '2025-05-31',
        academic_year: '2024-25'
      },
      {
        program_id: 'MTECH-DS-2024',
        sem_no: 1,
        start_date: '2024-08-01',
        end_date: '2024-12-15',
        academic_year: '2024-25'
      }
    ];

    console.log('Adding semesters...');
    for (const semester of semesters) {
      await addDoc(collection(db, 'semesters'), {
        ...semester,
        created_at: new Date()
      });
    }

    // 3. Courses
    const courses = [
      {
        code: 'CS101',
        title: 'Introduction to Computer Science',
        short_desc: 'Fundamental concepts of computer science and programming',
        long_desc: 'This course introduces students to the fundamental concepts of computer science, including algorithms, data structures, and programming principles.',
        credits: 4,
        ltp: '3:1:2',
        level: 'core',
        status: 'active',
        program_id: 'BTECH-CSE-2024',
        semester_id: 'BTECH-CSE-2024-1',
        prerequisites: 'None',
        co_requisites: 'None',
        learning_outcomes: 'Understand basic programming concepts, Write simple programs, Analyze algorithms',
        assessment_methods: 'Mid-term exam (30%), Final exam (40%), Lab assignments (30%)',
        textbooks: 'Introduction to Computer Science by John Doe',
        references: 'Computer Science: An Overview by Glenn Brookshear'
      },
      {
        code: 'CS201',
        title: 'Data Structures and Algorithms',
        short_desc: 'Advanced data structures and algorithm analysis',
        long_desc: 'This course covers fundamental data structures, algorithm design techniques, and complexity analysis.',
        credits: 4,
        ltp: '3:1:2',
        level: 'core',
        status: 'active',
        program_id: 'BTECH-CSE-2024',
        semester_id: 'BTECH-CSE-2024-2',
        prerequisites: 'CS101',
        co_requisites: 'None',
        learning_outcomes: 'Implement various data structures, Analyze algorithm complexity, Design efficient algorithms',
        assessment_methods: 'Mid-term exam (30%), Final exam (40%), Programming assignments (30%)',
        textbooks: 'Data Structures and Algorithms by Robert Sedgewick',
        references: 'Introduction to Algorithms by Cormen et al.'
      },
      {
        code: 'DS501',
        title: 'Machine Learning Fundamentals',
        short_desc: 'Introduction to machine learning algorithms and techniques',
        long_desc: 'This course provides a comprehensive introduction to machine learning algorithms, statistical learning theory, and practical applications.',
        credits: 4,
        ltp: '3:1:2',
        level: 'core',
        status: 'active',
        program_id: 'MTECH-DS-2024',
        semester_id: 'MTECH-DS-2024-1',
        prerequisites: 'Linear Algebra, Statistics',
        co_requisites: 'None',
        learning_outcomes: 'Understand ML algorithms, Implement ML models, Evaluate model performance',
        assessment_methods: 'Mid-term exam (25%), Final exam (35%), Project (40%)',
        textbooks: 'Pattern Recognition and Machine Learning by Christopher Bishop',
        references: 'The Elements of Statistical Learning by Hastie et al.'
      }
    ];

    console.log('Adding courses...');
    for (const course of courses) {
      await addDoc(collection(db, 'courses'), {
        ...course,
        created_at: new Date(),
        updated_at: new Date()
      });
    }

    // 4. Program Outcomes (POs)
    const pos = [
      {
        code: 'PO1',
        description: 'Engineering knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.'
      },
      {
        code: 'PO2',
        description: 'Problem analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.'
      },
      {
        code: 'PO3',
        description: 'Design/development of solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.'
      },
      {
        code: 'PO4',
        description: 'Conduct investigations of complex problems: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.'
      },
      {
        code: 'PO5',
        description: 'Modern tool usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.'
      }
    ];

    console.log('Adding program outcomes...');
    for (const po of pos) {
      await addDoc(collection(db, 'pos'), {
        ...po,
        created_at: new Date()
      });
    }

    // 5. Sample Syllabus
    const syllabus = {
      course_id: 'CS101',
      version_no: 1,
      status: 'draft',
      sections: [
        {
          id: 1,
          type: 'objectives',
          content: 'To introduce fundamental concepts of computer science and programming. To develop problem-solving skills through programming exercises. To understand basic algorithms and data structures.',
          order: 1
        },
        {
          id: 2,
          type: 'topics',
          content: 'Introduction to Programming, Variables and Data Types, Control Structures, Functions, Arrays, Basic Algorithms, Introduction to Object-Oriented Programming',
          order: 2
        },
        {
          id: 3,
          type: 'assessment',
          content: 'Mid-term examination (30%), Final examination (40%), Laboratory assignments (20%), Class participation (10%)',
          order: 3
        }
      ],
      topics: [
        {
          id: 1,
          title: 'Introduction to Programming',
          hours_estimated: 8,
          subtopics: ['What is programming?', 'Programming languages', 'Development environment setup'],
          resources: ['Programming textbook', 'Online tutorials', 'IDE documentation']
        },
        {
          id: 2,
          title: 'Variables and Data Types',
          hours_estimated: 10,
          subtopics: ['Variables declaration', 'Data types', 'Type conversion'],
          resources: ['Language reference', 'Practice exercises']
        }
      ],
      clos: [
        {
          id: 1,
          clo_code: 'CLO1',
          description: 'Understand and explain fundamental programming concepts',
          bloom_level: 'understand'
        },
        {
          id: 2,
          clo_code: 'CLO2',
          description: 'Write simple programs using basic programming constructs',
          bloom_level: 'apply'
        },
        {
          id: 3,
          clo_code: 'CLO3',
          description: 'Analyze and debug simple programs',
          bloom_level: 'analyze'
        }
      ],
      assessments: [
        {
          id: 1,
          name: 'Mid-term Examination',
          type: 'mid',
          weightage: 30,
          rubrics: 'Multiple choice questions (50%), Short answer questions (30%), Programming problems (20%)'
        },
        {
          id: 2,
          name: 'Final Examination',
          type: 'end',
          weightage: 40,
          rubrics: 'Comprehensive programming problems (60%), Theory questions (40%)'
        },
        {
          id: 3,
          name: 'Laboratory Assignments',
          type: 'lab',
          weightage: 30,
          rubrics: 'Code quality (40%), Functionality (40%), Documentation (20%)'
        }
      ],
      effective_from: '2024-08-01',
      created_by: 'demo_user',
      created_at: new Date(),
      updated_at: new Date()
    };

    console.log('Adding sample syllabus...');
    await addDoc(collection(db, 'syllabi'), syllabus);

    // 6. Sample CLO-PO Mappings
    const mappings = [
      { clo_id: 1, po_id: 'PO1', weight: 0.8, course_id: 'CS101' },
      { clo_id: 1, po_id: 'PO2', weight: 0.6, course_id: 'CS101' },
      { clo_id: 2, po_id: 'PO3', weight: 0.7, course_id: 'CS101' },
      { clo_id: 2, po_id: 'PO5', weight: 0.9, course_id: 'CS101' },
      { clo_id: 3, po_id: 'PO2', weight: 0.8, course_id: 'CS101' },
      { clo_id: 3, po_id: 'PO4', weight: 0.6, course_id: 'CS101' }
    ];

    console.log('Adding CLO-PO mappings...');
    for (const mapping of mappings) {
      await addDoc(collection(db, 'clo_po_mappings'), {
        ...mapping,
        created_at: new Date()
      });
    }

    console.log('Demo data population completed successfully!');
    return true;

  } catch (error) {
    console.error('Error populating demo data:', error);
    return false;
  }
};

// Function to check if demo data exists
export const checkDemoData = async () => {
  try {
    const programsSnapshot = await getDocs(collection(db, 'programs'));
    return !programsSnapshot.empty;
  } catch (error) {
    console.error('Error checking demo data:', error);
    return false;
  }
};

// Function to clear demo data (for testing)
export const clearDemoData = async () => {
  try {
    console.log('Clearing demo data...');
    
    const collections = ['programs', 'semesters', 'courses', 'pos', 'syllabi', 'clo_po_mappings', 'approvals'];
    
    for (const collectionName of collections) {
      const snapshot = await getDocs(collection(db, collectionName));
      const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);
    }
    
    console.log('Demo data cleared successfully!');
    return true;
  } catch (error) {
    console.error('Error clearing demo data:', error);
    return false;
  }
};

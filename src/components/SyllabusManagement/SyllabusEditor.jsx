import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { 
  FaEdit, 
  FaSave, 
  FaEye, 
  FaHistory, 
  FaCheck, 
  FaTimes, 
  FaComments,
  FaFileAlt,
  FaDownload,
  FaUpload,
  FaPlus,
  FaTrash,
  FaClock,
  FaUser,
  FaCalendarAlt
} from 'react-icons/fa';

const SyllabusEditor = ({ courseId, onClose }) => {
  const [syllabus, setSyllabus] = useState({
    version_no: 1,
    status: 'draft',
    sections: [],
    topics: [],
    clos: [],
    assessments: [],
    effective_from: '',
    created_by: 'current_user',
    created_at: new Date()
  });

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [syllabusHistory, setSyllabusHistory] = useState([]);

  const sectionTypes = [
    { id: 'objectives', label: 'Course Objectives', icon: '🎯' },
    { id: 'topics', label: 'Topics & Content', icon: '📚' },
    { id: 'assessment', label: 'Assessment Methods', icon: '📝' },
    { id: 'pedagogy', label: 'Teaching Methods', icon: '👨‍🏫' },
    { id: 'resources', label: 'Learning Resources', icon: '📖' },
    { id: 'outcomes', label: 'Learning Outcomes', icon: '✅' }
  ];

  useEffect(() => {
    fetchCourses();
    if (courseId) {
      fetchSyllabusHistory(courseId);
    }
  }, [courseId]);

  const fetchCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
      if (courseId) {
        const course = coursesData.find(c => c.id === courseId);
        setSelectedCourse(course);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchSyllabusHistory = async (courseId) => {
    try {
      const historySnapshot = await getDocs(
        query(
          collection(db, 'syllabi'),
          where('course_id', '==', courseId),
          orderBy('version_no', 'desc')
        )
      );
      const historyData = historySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSyllabusHistory(historyData);
    } catch (error) {
      console.error('Error fetching syllabus history:', error);
    }
  };

  const addSection = (type) => {
    const newSection = {
      id: Date.now(),
      type,
      content: '',
      order: syllabus.sections.length + 1
    };
    setSyllabus({
      ...syllabus,
      sections: [...syllabus.sections, newSection]
    });
  };

  const updateSection = (sectionId, content) => {
    setSyllabus({
      ...syllabus,
      sections: syllabus.sections.map(section =>
        section.id === sectionId ? { ...section, content } : section
      )
    });
  };

  const addTopic = () => {
    const newTopic = {
      id: Date.now(),
      title: '',
      hours_estimated: 0,
      subtopics: [],
      resources: []
    };
    setSyllabus({
      ...syllabus,
      topics: [...syllabus.topics, newTopic]
    });
  };

  const addCLO = () => {
    const newCLO = {
      id: Date.now(),
      clo_code: `CLO${syllabus.clos.length + 1}`,
      description: '',
      bloom_level: 'remember'
    };
    setSyllabus({
      ...syllabus,
      clos: [...syllabus.clos, newCLO]
    });
  };

  const addAssessment = () => {
    const newAssessment = {
      id: Date.now(),
      name: '',
      type: 'quiz',
      weightage: 0,
      rubrics: ''
    };
    setSyllabus({
      ...syllabus,
      assessments: [...syllabus.assessments, newAssessment]
    });
  };

  const saveSyllabus = async () => {
    setLoading(true);
    try {
      const syllabusData = {
        ...syllabus,
        course_id: selectedCourse.id,
        updated_at: new Date()
      };

      await addDoc(collection(db, 'syllabi'), syllabusData);
      alert('Syllabus saved successfully!');
      fetchSyllabusHistory(selectedCourse.id);
    } catch (error) {
      console.error('Error saving syllabus:', error);
      alert('Error saving syllabus. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async () => {
    if (window.confirm('Submit syllabus for review? This will change status to "Under Review".')) {
      setLoading(true);
      try {
        const updatedSyllabus = {
          ...syllabus,
          status: 'under_review',
          submitted_at: new Date()
        };
        await addDoc(collection(db, 'syllabi'), updatedSyllabus);
        alert('Syllabus submitted for review!');
        fetchSyllabusHistory(selectedCourse.id);
      } catch (error) {
        console.error('Error submitting syllabus:', error);
        alert('Error submitting syllabus. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'under_review': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'published': 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Course Information</h3>
        {selectedCourse && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-600">Course Code</label>
              <p className="text-lg text-gray-800">{selectedCourse.code}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600">Course Title</label>
              <p className="text-lg text-gray-800">{selectedCourse.title}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600">Credits</label>
              <p className="text-lg text-gray-800">{selectedCourse.credits}</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-600">L:T:P</label>
              <p className="text-lg text-gray-800">{selectedCourse.ltp || 'N/A'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Syllabus Sections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sectionTypes.map(type => (
            <button
              key={type.id}
              onClick={() => addSection(type.id)}
              className="p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-center"
            >
              <div className="text-2xl mb-2">{type.icon}</div>
              <div className="font-medium text-gray-700">{type.label}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSectionsTab = () => (
    <div className="space-y-6">
      {syllabus.sections.map(section => (
        <div key={section.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-gray-800">
              {sectionTypes.find(t => t.id === section.type)?.label}
            </h3>
            <button
              onClick={() => {
                setSyllabus({
                  ...syllabus,
                  sections: syllabus.sections.filter(s => s.id !== section.id)
                });
              }}
              className="text-red-500 hover:text-red-700"
            >
              <FaTrash />
            </button>
          </div>
          <textarea
            value={section.content}
            onChange={(e) => updateSection(section.id, e.target.value)}
            rows="6"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={`Enter ${sectionTypes.find(t => t.id === section.type)?.label.toLowerCase()}...`}
          />
        </div>
      ))}
      
      {syllabus.sections.length === 0 && (
        <div className="text-center py-12">
          <FaFileAlt className="text-4xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No sections added yet. Add sections from the Overview tab.</p>
        </div>
      )}
    </div>
  );

  const renderTopicsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Course Topics</h3>
        <button
          onClick={addTopic}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
        >
          <FaPlus />
          Add Topic
        </button>
      </div>

      {syllabus.topics.map((topic, index) => (
        <div key={topic.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Topic Title</label>
              <input
                type="text"
                value={topic.title}
                onChange={(e) => {
                  const updatedTopics = [...syllabus.topics];
                  updatedTopics[index].title = e.target.value;
                  setSyllabus({ ...syllabus, topics: updatedTopics });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Hours</label>
              <input
                type="number"
                min="0"
                value={topic.hours_estimated}
                onChange={(e) => {
                  const updatedTopics = [...syllabus.topics];
                  updatedTopics[index].hours_estimated = parseInt(e.target.value);
                  setSyllabus({ ...syllabus, topics: updatedTopics });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const updatedTopics = syllabus.topics.filter(t => t.id !== topic.id);
                  setSyllabus({ ...syllabus, topics: updatedTopics });
                }}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <FaTrash />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCLOsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Course Learning Outcomes (CLOs)</h3>
        <button
          onClick={addCLO}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          <FaPlus />
          Add CLO
        </button>
      </div>

      {syllabus.clos.map((clo, index) => (
        <div key={clo.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">CLO Code</label>
              <input
                type="text"
                value={clo.clo_code}
                onChange={(e) => {
                  const updatedCLOs = [...syllabus.clos];
                  updatedCLOs[index].clo_code = e.target.value;
                  setSyllabus({ ...syllabus, clos: updatedCLOs });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bloom Level</label>
              <select
                value={clo.bloom_level}
                onChange={(e) => {
                  const updatedCLOs = [...syllabus.clos];
                  updatedCLOs[index].bloom_level = e.target.value;
                  setSyllabus({ ...syllabus, clos: updatedCLOs });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="remember">Remember</option>
                <option value="understand">Understand</option>
                <option value="apply">Apply</option>
                <option value="analyze">Analyze</option>
                <option value="evaluate">Evaluate</option>
                <option value="create">Create</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const updatedCLOs = syllabus.clos.filter(c => c.id !== clo.id);
                  setSyllabus({ ...syllabus, clos: updatedCLOs });
                }}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
            <textarea
              value={clo.description}
              onChange={(e) => {
                const updatedCLOs = [...syllabus.clos];
                updatedCLOs[index].description = e.target.value;
                setSyllabus({ ...syllabus, clos: updatedCLOs });
              }}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the learning outcome..."
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderAssessmentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">Assessment Methods</h3>
        <button
          onClick={addAssessment}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
        >
          <FaPlus />
          Add Assessment
        </button>
      </div>

      {syllabus.assessments.map((assessment, index) => (
        <div key={assessment.id} className="bg-white rounded-xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Assessment Name</label>
              <input
                type="text"
                value={assessment.name}
                onChange={(e) => {
                  const updatedAssessments = [...syllabus.assessments];
                  updatedAssessments[index].name = e.target.value;
                  setSyllabus({ ...syllabus, assessments: updatedAssessments });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
              <select
                value={assessment.type}
                onChange={(e) => {
                  const updatedAssessments = [...syllabus.assessments];
                  updatedAssessments[index].type = e.target.value;
                  setSyllabus({ ...syllabus, assessments: updatedAssessments });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="quiz">Quiz</option>
                <option value="mid">Mid-term</option>
                <option value="end">End-term</option>
                <option value="lab">Lab</option>
                <option value="project">Project</option>
                <option value="assignment">Assignment</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Weightage (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                value={assessment.weightage}
                onChange={(e) => {
                  const updatedAssessments = [...syllabus.assessments];
                  updatedAssessments[index].weightage = parseInt(e.target.value);
                  setSyllabus({ ...syllabus, assessments: updatedAssessments });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  const updatedAssessments = syllabus.assessments.filter(a => a.id !== assessment.id);
                  setSyllabus({ ...syllabus, assessments: updatedAssessments });
                }}
                className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                <FaTrash />
              </button>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rubrics</label>
            <textarea
              value={assessment.rubrics}
              onChange={(e) => {
                const updatedAssessments = [...syllabus.assessments];
                updatedAssessments[index].rubrics = e.target.value;
                setSyllabus({ ...syllabus, assessments: updatedAssessments });
              }}
              rows="3"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Assessment rubrics and criteria..."
            />
          </div>
        </div>
      ))}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FaEye },
    { id: 'sections', label: 'Sections', icon: FaFileAlt },
    { id: 'topics', label: 'Topics', icon: FaEdit },
    { id: 'clos', label: 'CLOs', icon: FaCheck },
    { id: 'assessments', label: 'Assessments', icon: FaComments }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-7xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Syllabus Editor</h2>
              <p className="text-gray-600">
                {selectedCourse ? `${selectedCourse.code} - ${selectedCourse.title}` : 'Select a course'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(syllabus.status)}`}>
                {syllabus.status}
              </span>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
              >
                <FaHistory />
                History
              </button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes className="text-xl" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200">
            <div className="p-4">
              <h3 className="font-semibold text-gray-800 mb-4">Navigation</h3>
              <div className="space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="text-lg" />
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              {activeTab === 'overview' && renderOverviewTab()}
              {activeTab === 'sections' && renderSectionsTab()}
              {activeTab === 'topics' && renderTopicsTab()}
              {activeTab === 'clos' && renderCLOsTab()}
              {activeTab === 'assessments' && renderAssessmentsTab()}
            </div>
          </div>

          {/* History Panel */}
          {showHistory && (
            <div className="w-80 bg-gray-50 border-l border-gray-200 overflow-y-auto">
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 mb-4">Version History</h3>
                <div className="space-y-4">
                  {syllabusHistory.map(version => (
                    <div key={version.id} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Version {version.version_no}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(version.status)}`}>
                          {version.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <FaUser className="text-gray-400" />
                          <span>{version.created_by}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          <span>{version.created_at?.toDate?.()?.toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={saveSyllabus}
                disabled={loading}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaSave />
                Save Draft
              </button>
              <button
                onClick={submitForReview}
                disabled={loading || syllabus.status !== 'draft'}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaCheck />
                Submit for Review
              </button>
            </div>
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                <FaDownload />
                Export
              </button>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2">
                <FaUpload />
                Import
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SyllabusEditor;

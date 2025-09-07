// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { 
  FaGraduationCap, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSave, 
  FaTimes, 
  FaCalendarAlt,
  FaUsers,
  FaBook,
  FaChartLine,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

const ProgramManagement = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    degree_type: 'UG',
    duration_years: '',
    intake_code: '',
    effective_from: '',
    effective_to: '',
    description: '',
    total_credits: '',
    max_students: '',
    department: '',
    coordinator: '',
    status: 'active'
  });

  const degreeTypes = ['UG', 'PG', 'PhD', 'Diploma'];
  const statusOptions = ['active', 'inactive', 'discontinued'];

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setLoading(true);
    try {
      const programsSnapshot = await getDocs(
        query(collection(db, 'programs'), orderBy('name'))
      );
      const programsData = programsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPrograms(programsData);
    } catch (error) {
      console.error('Error fetching programs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const programData = {
        ...formData,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: 'current_user_id',
        total_students: 0,
        total_courses: 0
      };

      if (editingProgram) {
        await updateDoc(doc(db, 'programs', editingProgram.id), {
          ...programData,
          updated_at: new Date()
        });
      } else {
        await addDoc(collection(db, 'programs'), programData);
      }

      setShowForm(false);
      setEditingProgram(null);
      resetForm();
      fetchPrograms();
      alert(editingProgram ? 'Program updated successfully!' : 'Program created successfully!');
    } catch (error) {
      console.error('Error saving program:', error);
      alert('Error saving program. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (program) => {
    setEditingProgram(program);
    setFormData({
      name: program.name,
      degree_type: program.degree_type,
      duration_years: program.duration_years,
      intake_code: program.intake_code,
      effective_from: program.effective_from,
      effective_to: program.effective_to,
      description: program.description || '',
      total_credits: program.total_credits || '',
      max_students: program.max_students || '',
      department: program.department || '',
      coordinator: program.coordinator || '',
      status: program.status
    });
    setShowForm(true);
  };

  const handleDelete = async (program) => {
    if (window.confirm(`Are you sure you want to delete the program "${program.name}"?`)) {
      setLoading(true);
      try {
        await deleteDoc(doc(db, 'programs', program.id));
        fetchPrograms();
        alert('Program deleted successfully!');
      } catch (error) {
        console.error('Error deleting program:', error);
        alert('Error deleting program. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      degree_type: 'UG',
      duration_years: '',
      intake_code: '',
      effective_from: '',
      effective_to: '',
      description: '',
      total_credits: '',
      max_students: '',
      department: '',
      coordinator: '',
      status: 'active'
    });
  };

  const filteredPrograms = programs.filter(program => {
    const matchesSearch = program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         program.intake_code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || program.degree_type === filterType;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'discontinued': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDegreeTypeColor = (type) => {
    const colors = {
      'UG': 'bg-blue-100 text-blue-800',
      'PG': 'bg-purple-100 text-purple-800',
      'PhD': 'bg-orange-100 text-orange-800',
      'Diploma': 'bg-green-100 text-green-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-green-600 rounded-xl">
              <FaGraduationCap className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Program Management</h1>
              <p className="text-gray-600">Manage academic programs, degrees, and curriculum structure</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search programs by name or intake code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {degreeTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button 
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 flex items-center gap-2"
              >
                <FaPlus />
                Add Program
              </button>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.map(program => (
            <div key={program.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FaGraduationCap className="text-blue-600 text-2xl" />
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDegreeTypeColor(program.degree_type)}`}>
                    {program.degree_type}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(program.status)}`}>
                    {program.status}
                  </span>
                </div>
              </div>
              
              <h3 className="text-xl font-bold text-gray-800 mb-2">{program.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{program.description}</p>
              
              <div className="space-y-2 text-sm text-gray-600 mb-4">
                <div className="flex items-center gap-2">
                  <FaCalendarAlt className="text-blue-500" />
                  <span><strong>Duration:</strong> {program.duration_years} years</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaBook className="text-green-500" />
                  <span><strong>Credits:</strong> {program.total_credits || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaUsers className="text-purple-500" />
                  <span><strong>Students:</strong> {program.total_students || 0}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaChartLine className="text-orange-500" />
                  <span><strong>Courses:</strong> {program.total_courses || 0}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 text-sm flex items-center justify-center gap-1">
                  <FaEye />
                  Details
                </button>
                <button
                  onClick={() => handleEdit(program)}
                  className="bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 text-sm"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(program)}
                  className="bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredPrograms.length === 0 && !loading && (
          <div className="text-center py-20">
            <FaGraduationCap className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Programs Found</h3>
            <p className="text-gray-500">Create your first academic program to get started</p>
          </div>
        )}

        {/* Add/Edit Program Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {editingProgram ? 'Edit Program' : 'Add New Program'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingProgram(null);
                      resetForm();
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FaTimes className="text-xl" />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Program Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Degree Type *</label>
                    <select
                      value={formData.degree_type}
                      onChange={(e) => setFormData({...formData, degree_type: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      {degreeTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Duration (Years) *</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.duration_years}
                      onChange={(e) => setFormData({...formData, duration_years: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Intake Code *</label>
                    <input
                      type="text"
                      value={formData.intake_code}
                      onChange={(e) => setFormData({...formData, intake_code: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Effective From *</label>
                    <input
                      type="date"
                      value={formData.effective_from}
                      onChange={(e) => setFormData({...formData, effective_from: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Effective To</label>
                    <input
                      type="date"
                      value={formData.effective_to}
                      onChange={(e) => setFormData({...formData, effective_to: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Total Credits</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.total_credits}
                      onChange={(e) => setFormData({...formData, total_credits: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Max Students</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.max_students}
                      onChange={(e) => setFormData({...formData, max_students: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Department</label>
                    <input
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Coordinator</label>
                    <input
                      type="text"
                      value={formData.coordinator}
                      onChange={(e) => setFormData({...formData, coordinator: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter program description..."
                  />
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setEditingProgram(null);
                      resetForm();
                    }}
                    className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 flex items-center gap-2"
                  >
                    <FaTimes />
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave />
                        {editingProgram ? 'Update Program' : 'Create Program'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramManagement;

import React, { useState, useEffect } from 'react';
import { FaSave, FaUpload, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaTimes, FaUserTie, FaGraduationCap } from 'react-icons/fa';
import { collection, addDoc, updateDoc, doc, serverTimestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import BulkImportEvents from '../BulkImportEvents';

const EventCreation = ({ onEventCreated, editingEvent, isEditing = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    venue: '',
    organizerName: '',
    organizerEmail: '',
    organizerPhone: '',
    maxParticipants: '',
    isPaid: false,
    ticketPrice: '',
    budget: '',
    facultyCoordinators: [],
    studentVolunteers: [],
    equipment: [],
    approvalStatus: 'pending',
    status: 'draft',
    // New fields
    resourcePersonName: '',
    coordinators: [],
    academicYear: '',
    eventType: '',
    totalParticipants: '',
    yearOfStudents: ''
  });

  const [facultyList, setFacultyList] = useState([]);
  const [studentList, setStudentList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showBulkImport, setShowBulkImport] = useState(false);

  const eventCategories = [
    'Academic',
    'Cultural',
    'Technical',
    'Sports',
    'Placement',
    'Workshop',
    'Seminar',
    'Conference',
    'Hackathon',
    'Competition',
    'Guest Lecture',
    'Other'
  ];

  const eventTypes = [
    'Internal',
    'External',
    'Inter-University',
    'National',
    'International',
    'Industry Collaboration',
    'Research',
    'Extension Activity',
    'Other'
  ];

  const academicYears = [
    '2023-24',
    '2024-25',
    '2025-26',
    '2026-27',
    '2027-28'
  ];

  const studentYears = [
    '1st Year',
    '2nd Year',
    '3rd Year',
    '4th Year',
    'All Years',
    'PG Students',
    'PhD Students'
  ];

  const equipmentOptions = [
    'Projector',
    'Sound System',
    'Microphone',
    'Stage',
    'Chairs',
    'Tables',
    'Whiteboard',
    'Computer Lab',
    'Internet Connection',
    'Catering',
    'Security',
    'Medical Support'
  ];

  useEffect(() => {
    fetchFacultyAndStudents();
  }, []);

  // Load editing event data when in editing mode
  useEffect(() => {
    if (isEditing && editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        category: editingEvent.category || '',
        startDate: editingEvent.startDate ? new Date(editingEvent.startDate).toISOString().split('T')[0] : '',
        endDate: editingEvent.endDate ? new Date(editingEvent.endDate).toISOString().split('T')[0] : '',
        startTime: editingEvent.startTime || '',
        endTime: editingEvent.endTime || '',
        venue: editingEvent.venue || '',
        organizerName: editingEvent.organizerName || '',
        organizerEmail: editingEvent.organizerEmail || '',
        organizerPhone: editingEvent.organizerPhone || '',
        maxParticipants: editingEvent.maxParticipants || '',
        isPaid: editingEvent.isPaid || false,
        ticketPrice: editingEvent.ticketPrice || '',
        budget: editingEvent.budget || '',
        facultyCoordinators: editingEvent.facultyCoordinators || [],
        studentVolunteers: editingEvent.studentVolunteers || [],
        equipment: editingEvent.equipment || [],
        approvalStatus: editingEvent.approvalStatus || 'pending',
        status: editingEvent.status || 'draft',
        // New fields
        resourcePersonName: editingEvent.resourcePersonName || '',
        coordinators: editingEvent.coordinators || [],
        academicYear: editingEvent.academicYear || '',
        eventType: editingEvent.eventType || '',
        totalParticipants: editingEvent.totalParticipants || '',
        yearOfStudents: editingEvent.yearOfStudents || ''
      });
    }
  }, [isEditing, editingEvent]);

  const fetchFacultyAndStudents = async () => {
    try {
      // Fetch faculty
      const facultyRef = collection(db, 'faculty');
      const facultySnapshot = await getDocs(facultyRef);
      const facultyData = facultySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setFacultyList(facultyData);

      // Fetch students
      const studentsRef = collection(db, 'students');
      const studentsSnapshot = await getDocs(studentsRef);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudentList(studentsData);
    } catch (error) {
      console.error('Error fetching faculty and students:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleArrayChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['title', 'description', 'category', 'startDate', 'endDate', 'venue', 'organizerName'];
    for (let field of required) {
      if (!formData[field]) {
        setMessage({ type: 'error', text: `${field.charAt(0).toUpperCase() + field.slice(1)} is required` });
        return false;
      }
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setMessage({ type: 'error', text: 'End date must be after start date' });
      return false;
    }

    if (formData.isPaid && !formData.ticketPrice) {
      setMessage({ type: 'error', text: 'Ticket price is required for paid events' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      if (isEditing && editingEvent) {
        // Update existing event
        const eventData = {
          ...formData,
          updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
        
        setMessage({ 
          type: 'success', 
          text: `Event "${formData.title}" updated successfully!` 
        });
      } else {
        // Create new event
        const eventData = {
          ...formData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          registrations: [],
          attendance: [],
          feedback: [],
          photos: [],
          videos: [],
          documents: []
        };

        const docRef = await addDoc(collection(db, 'events'), eventData);
        
        setMessage({ 
          type: 'success', 
          text: `Event "${formData.title}" created successfully! Event ID: ${docRef.id}` 
        });
        
        // Reset form only for new events
        setFormData({
          title: '',
          description: '',
          category: '',
          startDate: '',
          endDate: '',
          startTime: '',
          endTime: '',
          venue: '',
          organizerName: '',
          organizerEmail: '',
          organizerPhone: '',
          maxParticipants: '',
          isPaid: false,
          ticketPrice: '',
          budget: '',
          facultyCoordinators: [],
          studentVolunteers: [],
          equipment: [],
          approvalStatus: 'pending',
          status: 'draft',
          // New fields
          resourcePersonName: '',
          coordinators: [],
          academicYear: '',
          eventType: '',
          totalParticipants: '',
          yearOfStudents: ''
        });
      }

      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setMessage({ 
        type: 'error', 
        text: isEditing ? 'Failed to update event. Please try again.' : 'Failed to create event. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setFormData(prev => ({ ...prev, status: 'draft' }));
    await handleSubmit(new Event('submit'));
  };

  const handleSubmitForApproval = async () => {
    setFormData(prev => ({ ...prev, status: 'pending_approval' }));
    await handleSubmit(new Event('submit'));
  };

  const handleBulkImportSuccess = (count) => {
    setShowBulkImport(false);
    if (onEventCreated) {
      onEventCreated();
    }
    setMessage({ 
      type: 'success', 
      text: `Successfully imported ${count} events!` 
    });
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className="text-gray-600">
              {isEditing ? 'Update the event details below' : 'Fill in the details below to create a new event'}
            </p>
          </div>
          <button
            onClick={() => setShowBulkImport(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <FaUpload className="mr-2" />
            Bulk Import Events
          </button>
        </div>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <FaCheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <FaTimes className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select category</option>
                {eventCategories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Type
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select event type</option>
                {eventTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Academic Year
              </label>
              <select
                name="academicYear"
                value={formData.academicYear}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select academic year</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Resource Person Name
              </label>
              <input
                type="text"
                name="resourcePersonName"
                value={formData.resourcePersonName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter resource person name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Year of Students
              </label>
              <select
                name="yearOfStudents"
                value={formData.yearOfStudents}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select target year</option>
                {studentYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the event details, objectives, and what participants can expect"
              />
            </div>
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Date and Time</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Venue and Organizer */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Venue and Organizer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Venue *
              </label>
              <input
                type="text"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter venue details"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer Name *
              </label>
              <input
                type="text"
                name="organizerName"
                value={formData.organizerName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organizer name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer Email
              </label>
              <input
                type="email"
                name="organizerEmail"
                value={formData.organizerEmail}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organizer email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organizer Phone
              </label>
              <input
                type="tel"
                name="organizerPhone"
                value={formData.organizerPhone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter organizer phone"
              />
            </div>
          </div>
        </div>

        {/* Participation and Pricing */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Participation and Pricing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Participants
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter max participants"
                min="1"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total No. of Participants
              </label>
              <input
                type="number"
                name="totalParticipants"
                value={formData.totalParticipants}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total participants"
                min="1"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="isPaid"
                  checked={formData.isPaid}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Paid Event</span>
              </label>
            </div>

            {formData.isPaid && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ticket Price (₹)
                </label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter ticket price"
                  min="0"
                  step="0.01"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget (₹)
              </label>
              <input
                type="number"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* Coordinators and Volunteers */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Coordinators and Volunteers</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Faculty Coordinators
              </label>
              <select
                multiple
                value={formData.facultyCoordinators}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleArrayChange('facultyCoordinators', values);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size="4"
              >
                {facultyList.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} - {faculty.department}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coordinators
              </label>
              <select
                multiple
                value={formData.coordinators}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleArrayChange('coordinators', values);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size="4"
              >
                {facultyList.map(faculty => (
                  <option key={faculty.id} value={faculty.id}>
                    {faculty.name} - {faculty.department}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Student Volunteers
              </label>
              <select
                multiple
                value={formData.studentVolunteers}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleArrayChange('studentVolunteers', values);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                size="4"
              >
                {studentList.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.name} - {student.rollNo}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
            </div>
          </div>
        </div>

        {/* Equipment Requirements */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Equipment Requirements</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {equipmentOptions.map(equipment => (
              <label key={equipment} className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.equipment.includes(equipment)}
                  onChange={(e) => {
                    const newEquipment = e.target.checked
                      ? [...formData.equipment, equipment]
                      : formData.equipment.filter(item => item !== equipment);
                    handleArrayChange('equipment', newEquipment);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">{equipment}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={loading}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Save as Draft
          </button>
          <button
            type="button"
            onClick={handleSubmitForApproval}
            disabled={loading}
            className="px-6 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
          >
            Submit for Approval
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Event' : 'Create Event')}
          </button>
        </div>
      </form>

      {/* Bulk Import Modal */}
      {showBulkImport && (
        <BulkImportEvents
          onClose={() => setShowBulkImport(false)}
          onSuccess={handleBulkImportSuccess}
        />
      )}
    </div>
  );
};

export default EventCreation;

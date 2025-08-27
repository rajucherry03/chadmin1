import React, { useState, useEffect } from 'react';
import { FaSave, FaUpload, FaUsers, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaCheckCircle, FaTimes, FaUserTie, FaGraduationCap } from 'react-icons/fa';
import { collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const EventCreation = ({ onEventCreated, editingEvent, isEditing = false }) => {
  const [formData, setFormData] = useState({
    resourcePersonName: '',
    coordinators: [],
    academicYear: '',
    eventType: '',
    totalParticipants: '',
    yearOfStudents: '',
    eventDate: ''
  });

  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState([]);
  const [error, setError] = useState('');

  // Academic year options
  const academicYears = [
    '2023-24',
    '2024-25', 
    '2025-26',
    '2026-27',
    '2027-28'
  ];

  // Event type options
  const eventTypes = [
    'Internal',
    'External', 
    'Inter-University',
    'National',
    'International',
    'Workshop',
    'Seminar',
    'Conference',
    'Hackathon',
    'Cultural Event',
    'Sports Event',
    'Technical Event'
  ];

  // Year of students options
  const studentYears = [
    '1st Year',
    '2nd Year', 
    '3rd Year',
    '4th Year',
    'All Years',
    'PG Students',
    'PhD Students'
  ];

  useEffect(() => {
    fetchFacultyList();
    if (isEditing && editingEvent) {
      setFormData({
        resourcePersonName: editingEvent.resourcePersonName || '',
        coordinators: editingEvent.coordinators || [],
        academicYear: editingEvent.academicYear || '',
        eventType: editingEvent.eventType || '',
        totalParticipants: editingEvent.totalParticipants || '',
        yearOfStudents: editingEvent.yearOfStudents || '',
        eventDate: editingEvent.eventDate || ''
      });
    }
  }, [isEditing, editingEvent]);

  const fetchFacultyList = async () => {
    try {
      const facultyQuery = query(collection(db, 'faculty'));
      const facultySnapshot = await getDocs(facultyQuery);
      const faculty = facultySnapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || doc.data().fullName || 'Unknown Faculty'
      }));
      setFacultyList(faculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCoordinatorChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData(prev => ({
      ...prev,
      coordinators: selectedOptions
    }));
  };

  const validateForm = () => {
    if (!formData.resourcePersonName.trim()) {
      setError('Resource Person Name is required');
      return false;
    }
    if (formData.coordinators.length === 0) {
      setError('At least one coordinator must be selected');
      return false;
    }
    if (!formData.academicYear) {
      setError('Academic Year is required');
      return false;
    }
    if (!formData.eventType) {
      setError('Event Type is required');
      return false;
    }
    if (!formData.totalParticipants || formData.totalParticipants <= 0) {
      setError('Total No. of Participants must be greater than 0');
      return false;
    }
    if (!formData.yearOfStudents) {
      setError('Year of Students is required');
      return false;
    }
    if (!formData.eventDate) {
      setError('Event Date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const eventData = {
        ...formData,
        totalParticipants: parseInt(formData.totalParticipants),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      if (isEditing && editingEvent) {
        await updateDoc(doc(db, 'events', editingEvent.id), eventData);
      } else {
        await addDoc(collection(db, 'events'), eventData);
      }

      setFormData({
        resourcePersonName: '',
        coordinators: [],
        academicYear: '',
        eventType: '',
        totalParticipants: '',
        yearOfStudents: '',
        eventDate: ''
      });

      if (onEventCreated) {
        onEventCreated();
      }
    } catch (error) {
      console.error('Error saving event:', error);
      setError('Failed to save event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      resourcePersonName: '',
      coordinators: [],
      academicYear: '',
      eventType: '',
      totalParticipants: '',
      yearOfStudents: '',
      eventDate: ''
    });
    setError('');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {isEditing ? 'Edit Event' : 'Create New Event'}
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={handleReset}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Resource Person Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUserTie className="inline mr-2" />
            Resource Person Name *
          </label>
          <input
            type="text"
            name="resourcePersonName"
            value={formData.resourcePersonName}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter resource person name"
            required
          />
        </div>

        {/* Coordinators */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUsers className="inline mr-2" />
            Coordinators *
          </label>
          <select
            multiple
            name="coordinators"
            value={formData.coordinators}
            onChange={handleCoordinatorChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {facultyList.map(faculty => (
              <option key={faculty.id} value={faculty.id}>
                {faculty.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">
            Hold Ctrl (or Cmd on Mac) to select multiple coordinators
          </p>
        </div>

        {/* Academic Year */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2" />
            Academic Year *
          </label>
          <select
            name="academicYear"
            value={formData.academicYear}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Academic Year</option>
            {academicYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaMapMarkerAlt className="inline mr-2" />
            Event Type *
          </label>
          <select
            name="eventType"
            value={formData.eventType}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Event Type</option>
            {eventTypes.map(type => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Total No. of Participants */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaUsers className="inline mr-2" />
            Total No. of Participants *
          </label>
          <input
            type="number"
            name="totalParticipants"
            value={formData.totalParticipants}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter total number of participants"
            min="1"
            required
          />
        </div>

        {/* Year of Students */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaGraduationCap className="inline mr-2" />
            Year of Students *
          </label>
          <select
            name="yearOfStudents"
            value={formData.yearOfStudents}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="">Select Year of Students</option>
            {studentYears.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Event Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FaCalendarAlt className="inline mr-2" />
            Event Date *
          </label>
          <input
            type="date"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <FaCheckCircle className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <FaSave className="mr-2" />
                {isEditing ? 'Update Event' : 'Create Event'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreation;

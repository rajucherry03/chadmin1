import React, { useState, useEffect } from 'react';
import { FaUsers, FaTicketAlt, FaQrcode, FaDownload, FaUpload, FaSearch, FaFilter, FaEye, FaEdit, FaTrash, FaCheckCircle, FaTimes, FaClock } from 'react-icons/fa';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import QRCode from 'qrcode';

const EventRegistrations = ({ events, onRefresh }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [waitlist, setWaitlist] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    department: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    if (selectedEvent) {
      setRegistrations(selectedEvent.registrations || []);
      setWaitlist(selectedEvent.waitlist || []);
    }
  }, [selectedEvent]);

  const handleRegistration = async (eventId, participantData) => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const event = events.find(e => e.id === eventId);
      if (!event) {
        setMessage({ type: 'error', text: 'Event not found' });
        return;
      }

      // Check if event is full
      const currentRegistrations = event.registrations?.length || 0;
      const maxParticipants = event.maxParticipants || Infinity;

      if (currentRegistrations >= maxParticipants) {
        // Add to waitlist
        const waitlistEntry = {
          ...participantData,
          registrationId: generateRegistrationId(),
          registeredAt: new Date().toISOString(),
          status: 'waitlist'
        };

        await updateDoc(doc(db, 'events', eventId), {
          waitlist: arrayUnion(waitlistEntry)
        });

        setMessage({ 
          type: 'warning', 
          text: `Event is full. You have been added to the waitlist with ID: ${waitlistEntry.registrationId}` 
        });
      } else {
        // Add to registrations
        const registration = {
          ...participantData,
          registrationId: generateRegistrationId(),
          registeredAt: new Date().toISOString(),
          status: 'registered',
          qrCode: await generateQRCode(participantData.registrationId)
        };

        await updateDoc(doc(db, 'events', eventId), {
          registrations: arrayUnion(registration)
        });

        setMessage({ 
          type: 'success', 
          text: `Registration successful! Your registration ID is: ${registration.registrationId}` 
        });
      }

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error registering for event:', error);
      setMessage({ type: 'error', text: 'Failed to register. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const generateRegistrationId = () => {
    return 'REG' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  };

  const generateQRCode = async (registrationId) => {
    try {
      return await QRCode.toDataURL(registrationId);
    } catch (error) {
      console.error('Error generating QR code:', error);
      return null;
    }
  };

  const handleWaitlistPromotion = async (eventId, waitlistEntry) => {
    try {
      const event = events.find(e => e.id === eventId);
      const currentRegistrations = event.registrations?.length || 0;
      const maxParticipants = event.maxParticipants || Infinity;

      if (currentRegistrations < maxParticipants) {
        // Promote from waitlist to registration
        const registration = {
          ...waitlistEntry,
          status: 'registered',
          promotedAt: new Date().toISOString(),
          qrCode: await generateQRCode(waitlistEntry.registrationId)
        };

        await updateDoc(doc(db, 'events', eventId), {
          registrations: arrayUnion(registration),
          waitlist: arrayRemove(waitlistEntry)
        });

        setMessage({ 
          type: 'success', 
          text: `${waitlistEntry.name} has been promoted from waitlist to registered` 
        });

        if (onRefresh) onRefresh();
      } else {
        setMessage({ type: 'error', text: 'Event is at maximum capacity' });
      }
    } catch (error) {
      console.error('Error promoting from waitlist:', error);
      setMessage({ type: 'error', text: 'Failed to promote from waitlist' });
    }
  };

  const handleRegistrationCancellation = async (eventId, registration) => {
    try {
      await updateDoc(doc(db, 'events', eventId), {
        registrations: arrayRemove(registration)
      });

      // Promote first person from waitlist if available
      const event = events.find(e => e.id === eventId);
      if (event.waitlist && event.waitlist.length > 0) {
        const nextInWaitlist = event.waitlist[0];
        await handleWaitlistPromotion(eventId, nextInWaitlist);
      }

      setMessage({ type: 'success', text: 'Registration cancelled successfully' });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error cancelling registration:', error);
      setMessage({ type: 'error', text: 'Failed to cancel registration' });
    }
  };

  const exportRegistrations = (eventId) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    const data = event.registrations?.map(reg => ({
      'Registration ID': reg.registrationId,
      'Name': reg.name,
      'Email': reg.email,
      'Phone': reg.phone,
      'Department': reg.department,
      'Roll No': reg.rollNo,
      'Status': reg.status,
      'Registered At': new Date(reg.registeredAt).toLocaleString()
    })) || [];

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title}_registrations.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredEvents = events.filter(event => {
    if (filters.search) {
      return event.title.toLowerCase().includes(filters.search.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Registrations</h2>
        <p className="text-gray-600">Manage event registrations, waitlists, and participant data</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 
          message.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
          'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <FaCheckCircle className="h-5 w-5 mr-2" />
            ) : message.type === 'warning' ? (
              <FaClock className="h-5 w-5 mr-2" />
            ) : (
              <FaTimes className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search events..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="ongoing">Ongoing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Events</h3>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {filteredEvents.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedEvent?.id === event.id
                      ? 'bg-blue-50 border-blue-200 border'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  <h4 className="font-medium text-gray-900">{event.title}</h4>
                  <p className="text-sm text-gray-500">{event.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {event.registrations?.length || 0} registered
                      </span>
                      {event.waitlist?.length > 0 && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          {event.waitlist.length} waitlist
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Details */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="space-y-6">
              {/* Event Info */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                    <p className="text-gray-600">{selectedEvent.description}</p>
                  </div>
                  <button
                    onClick={() => exportRegistrations(selectedEvent.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-2"
                  >
                    <FaDownload />
                    <span>Export</span>
                  </button>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {selectedEvent.registrations?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Registered</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {selectedEvent.waitlist?.length || 0}
                    </div>
                    <div className="text-sm text-gray-500">Waitlist</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {selectedEvent.maxParticipants || '∞'}
                    </div>
                    <div className="text-sm text-gray-500">Capacity</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {selectedEvent.isPaid ? `₹${selectedEvent.ticketPrice}` : 'Free'}
                    </div>
                    <div className="text-sm text-gray-500">Price</div>
                  </div>
                </div>
              </div>

              {/* Registrations */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Registrations</h3>
                </div>
                <div className="p-6">
                  {registrations.length > 0 ? (
                    <div className="space-y-4">
                      {registrations.map((registration, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium">{registration.name}</h4>
                                <span className="text-sm text-gray-500">{registration.registrationId}</span>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                                  Registered
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <p>Email: {registration.email}</p>
                                <p>Phone: {registration.phone}</p>
                                <p>Department: {registration.department}</p>
                                <p>Roll No: {registration.rollNo}</p>
                                <p>Registered: {new Date(registration.registeredAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {registration.qrCode && (
                                <img 
                                  src={registration.qrCode} 
                                  alt="QR Code" 
                                  className="w-16 h-16 border rounded"
                                />
                              )}
                              <button
                                onClick={() => handleRegistrationCancellation(selectedEvent.id, registration)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded"
                                title="Cancel Registration"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No registrations yet</p>
                  )}
                </div>
              </div>

              {/* Waitlist */}
              {waitlist.length > 0 && (
                <div className="bg-white rounded-lg shadow">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Waitlist</h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-4">
                      {waitlist.map((entry, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3">
                                <h4 className="font-medium">{entry.name}</h4>
                                <span className="text-sm text-gray-500">{entry.registrationId}</span>
                                <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                                  Waitlist #{index + 1}
                                </span>
                              </div>
                              <div className="mt-2 text-sm text-gray-600">
                                <p>Email: {entry.email}</p>
                                <p>Phone: {entry.phone}</p>
                                <p>Department: {entry.department}</p>
                                <p>Roll No: {entry.rollNo}</p>
                                <p>Added: {new Date(entry.registeredAt).toLocaleString()}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleWaitlistPromotion(selectedEvent.id, entry)}
                              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              disabled={registrations.length >= (selectedEvent.maxParticipants || Infinity)}
                            >
                              Promote
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-500">
                <FaUsers className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an event to view registrations</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventRegistrations;

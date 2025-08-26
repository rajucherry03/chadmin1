import React, { useState, useEffect } from 'react';
import { FaQrcode, FaUsers, FaCheckCircle, FaClock, FaTasks, FaCamera, FaDownload, FaUpload, FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import { collection, doc, updateDoc, arrayUnion, arrayRemove, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import QRCode from 'qrcode';

const EventExecution = ({ events, onRefresh }) => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ongoingEvents, setOngoingEvents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [qrCodeData, setQrCodeData] = useState(null);

  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    priority: 'medium',
    dueDate: '',
    status: 'pending'
  });

  useEffect(() => {
    filterOngoingEvents();
    if (selectedEvent) {
      setAttendanceData(selectedEvent.attendance || []);
      setTasks(selectedEvent.tasks || []);
      generateEventQRCode();
    }
  }, [events, selectedEvent]);

  const filterOngoingEvents = () => {
    const now = new Date();
    const ongoing = events.filter(event => {
      const start = new Date(event.startDate);
      const end = new Date(event.endDate);
      return now >= start && now <= end && event.status === 'approved';
    });
    setOngoingEvents(ongoing);
  };

  const generateEventQRCode = async () => {
    if (!selectedEvent) return;
    
    try {
      const qrData = {
        eventId: selectedEvent.id,
        eventTitle: selectedEvent.title,
        timestamp: new Date().toISOString()
      };
      const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
      setQrCodeData(qrCode);
    } catch (error) {
      console.error('Error generating QR code:', error);
    }
  };

  const handleAttendanceMarking = async (registrationId, status) => {
    if (!selectedEvent) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const attendanceEntry = {
        registrationId,
        status, // 'present', 'absent', 'late'
        markedAt: new Date().toISOString(),
        markedBy: 'admin' // In real app, this would be the current user
      };

      await updateDoc(doc(db, 'events', selectedEvent.id), {
        attendance: arrayUnion(attendanceEntry)
      });

      setMessage({ 
        type: 'success', 
        text: `Attendance marked as ${status} for registration ID: ${registrationId}` 
      });

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage({ type: 'error', text: 'Failed to mark attendance' });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const taskData = {
        ...taskForm,
        id: selectedTask ? selectedTask.id : Date.now().toString(),
        createdAt: selectedTask ? selectedTask.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (selectedTask) {
        // Update existing task
        const updatedTasks = tasks.map(task => 
          task.id === selectedTask.id ? taskData : task
        );
        await updateDoc(doc(db, 'events', selectedEvent.id), {
          tasks: updatedTasks
        });
        setMessage({ type: 'success', text: 'Task updated successfully' });
      } else {
        // Add new task
        await updateDoc(doc(db, 'events', selectedEvent.id), {
          tasks: arrayUnion(taskData)
        });
        setMessage({ type: 'success', text: 'Task added successfully' });
      }

      setShowTaskModal(false);
      setSelectedTask(null);
      setTaskForm({
        title: '',
        description: '',
        assignedTo: '',
        priority: 'medium',
        dueDate: '',
        status: 'pending'
      });

      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error saving task:', error);
      setMessage({ type: 'error', text: 'Failed to save task' });
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusUpdate = async (taskId, newStatus) => {
    if (!selectedEvent) return;

    try {
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, status: newStatus, updatedAt: new Date().toISOString() } : task
      );
      
      await updateDoc(doc(db, 'events', selectedEvent.id), {
        tasks: updatedTasks
      });

      setMessage({ type: 'success', text: 'Task status updated successfully' });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error updating task status:', error);
      setMessage({ type: 'error', text: 'Failed to update task status' });
    }
  };

  const handleTaskDelete = async (taskId) => {
    if (!selectedEvent || !window.confirm('Are you sure you want to delete this task?')) return;

    try {
      const updatedTasks = tasks.filter(task => task.id !== taskId);
      await updateDoc(doc(db, 'events', selectedEvent.id), {
        tasks: updatedTasks
      });

      setMessage({ type: 'success', text: 'Task deleted successfully' });
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error('Error deleting task:', error);
      setMessage({ type: 'error', text: 'Failed to delete task' });
    }
  };

  const exportAttendanceReport = () => {
    if (!selectedEvent) return;

    const data = selectedEvent.registrations?.map(reg => {
      const attendance = attendanceData.find(att => att.registrationId === reg.registrationId);
      return {
        'Registration ID': reg.registrationId,
        'Name': reg.name,
        'Email': reg.email,
        'Department': reg.department,
        'Roll No': reg.rollNo,
        'Attendance Status': attendance ? attendance.status : 'Not Marked',
        'Marked At': attendance ? new Date(attendance.markedAt).toLocaleString() : 'N/A'
      };
    }) || [];

    const csvContent = [
      Object.keys(data[0] || {}).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedEvent.title}_attendance_report.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'late': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Event Execution</h2>
        <p className="text-gray-600">Manage ongoing events, attendance, and tasks</p>
      </div>

      {message.text && (
        <div className={`mb-6 p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          <div className="flex items-center">
            {message.type === 'success' ? (
              <FaCheckCircle className="h-5 w-5 mr-2" />
            ) : (
              <FaClock className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Ongoing Events */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Ongoing Events</h3>
            </div>
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              {ongoingEvents.length > 0 ? (
                ongoingEvents.map(event => (
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
                    <p className="text-sm text-gray-500">{event.venue}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500">
                        {event.registrations?.length || 0} participants
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Ongoing
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No ongoing events</p>
              )}
            </div>
          </div>
        </div>

        {/* Event Details and QR Code */}
        <div className="lg:col-span-2">
          {selectedEvent ? (
            <div className="space-y-6">
              {/* Event Info and QR Code */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{selectedEvent.title}</h3>
                    <p className="text-gray-600">{selectedEvent.venue}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {new Date(selectedEvent.startDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm text-gray-500">
                      {selectedEvent.startTime} - {selectedEvent.endTime}
                    </div>
                  </div>
                </div>
                
                {qrCodeData && (
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <img src={qrCodeData} alt="Event QR Code" className="w-32 h-32 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Scan for attendance</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Attendance Management */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Attendance Management</h3>
                  <button
                    onClick={exportAttendanceReport}
                    className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center space-x-1"
                  >
                    <FaDownload className="h-3 w-3" />
                    <span>Export</span>
                  </button>
                </div>
                <div className="p-6">
                  {selectedEvent.registrations?.length > 0 ? (
                    <div className="space-y-3">
                      {selectedEvent.registrations.map((registration, index) => {
                        const attendance = attendanceData.find(att => att.registrationId === registration.registrationId);
                        return (
                          <div key={index} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium">{registration.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {registration.registrationId} • {registration.department}
                                </p>
                                <p className="text-sm text-gray-500">{registration.rollNo}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(attendance?.status)}`}>
                                  {attendance ? attendance.status : 'Not Marked'}
                                </span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleAttendanceMarking(registration.registrationId, 'present')}
                                    className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                  >
                                    Present
                                  </button>
                                  <button
                                    onClick={() => handleAttendanceMarking(registration.registrationId, 'absent')}
                                    className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                                  >
                                    Absent
                                  </button>
                                  <button
                                    onClick={() => handleAttendanceMarking(registration.registrationId, 'late')}
                                    className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                                  >
                                    Late
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No registrations for this event</p>
                  )}
                </div>
              </div>

              {/* Task Management */}
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Task Management</h3>
                  <button
                    onClick={() => setShowTaskModal(true)}
                    className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center space-x-1"
                  >
                    <FaPlus className="h-3 w-3" />
                    <span>Add Task</span>
                  </button>
                </div>
                <div className="p-6">
                  {tasks.length > 0 ? (
                    <div className="space-y-3">
                      {tasks.map((task, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-medium">{task.title}</h4>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(task.priority)}`}>
                                  {task.priority}
                                </span>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTaskStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600">{task.description}</p>
                              <p className="text-sm text-gray-500 mt-1">
                                Assigned to: {task.assignedTo} • Due: {task.dueDate}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <select
                                value={task.status}
                                onChange={(e) => handleTaskStatusUpdate(task.id, e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="pending">Pending</option>
                                <option value="in_progress">In Progress</option>
                                <option value="completed">Completed</option>
                              </select>
                              <button
                                onClick={() => {
                                  setSelectedTask(task);
                                  setTaskForm(task);
                                  setShowTaskModal(true);
                                }}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={() => handleTaskDelete(task.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No tasks for this event</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="text-center text-gray-500">
                <FaQrcode className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Select an ongoing event to manage execution</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-96 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {selectedTask ? 'Edit Task' : 'Add New Task'}
              </h3>
              <button
                onClick={() => {
                  setShowTaskModal(false);
                  setSelectedTask(null);
                  setTaskForm({
                    title: '',
                    description: '',
                    assignedTo: '',
                    priority: 'medium',
                    dueDate: '',
                    status: 'pending'
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleTaskSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
                  <input
                    type="text"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : (selectedTask ? 'Update' : 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventExecution;

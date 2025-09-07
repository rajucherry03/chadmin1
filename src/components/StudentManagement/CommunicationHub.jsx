import React, { useState, useEffect } from "react";
import studentApiService from '../../services/studentApiService';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelopeOpen, faSave, faDownload, faUndo, faCheckCircle,
  faExclamationTriangle, faEye, faEdit, faTrash, faPlus,
  faCog, faHistory, faQrcode, faPrint, faShare, faPaperPlane,
  faUserPlus, faCopy, faArrowsRotate, faBell, faComment, faComments,
  faTimes, faSpinner, faBullhorn, faEnvelope, faPhone
} from "@fortawesome/free-solid-svg-icons";
const CommunicationHub = ({ students }) => {
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [messageType, setMessageType] = useState("announcement");
  const [messageSubject, setMessageSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [priority, setPriority] = useState("normal");
  const [showHistory, setShowHistory] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [showComposeModal, setShowComposeModal] = useState(false);

  // Message types
  const messageTypes = [
    { id: "announcement", name: "Announcement", icon: faBullhorn, color: "blue" },
    { id: "notification", name: "Notification", icon: faBell, color: "green" },
    { id: "email", name: "Email", icon: faEnvelope, color: "purple" },
    { id: "sms", name: "SMS", icon: faPhone, color: "orange" }
  ];

  // Priority levels
  const priorityLevels = [
    { id: "low", name: "Low", color: "gray" },
    { id: "normal", name: "Normal", color: "blue" },
    { id: "high", name: "High", color: "orange" },
    { id: "urgent", name: "Urgent", color: "red" }
  ];

  // Sample announcements
  const sampleAnnouncements = [
    {
      id: 1,
      type: "announcement",
      subject: "Exam Schedule Update",
      body: "The final examination schedule has been updated. Please check the student portal for the latest schedule.",
      priority: "high",
      sentAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      sentBy: "admin",
      recipients: students.length,
      status: "sent"
    },
    {
      id: 2,
      type: "notification",
      subject: "Fee Payment Reminder",
      body: "This is a reminder that the last date for fee payment is approaching. Please complete your payment before the deadline.",
      priority: "normal",
      sentAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      sentBy: "admin",
      recipients: students.length,
      status: "sent"
    }
  ];

  useEffect(() => {
    setAnnouncements(sampleAnnouncements);
  }, []);

  // Select all students
  const selectAllStudents = () => {
    setSelectedStudents(students);
  };

  // Clear selection
  const clearSelection = () => {
    setSelectedStudents([]);
  };

  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setSelectedStudents(prev => 
      prev.includes(studentId) 
        ? prev.filter(id => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Send message
  const sendMessage = async () => {
    if (!messageSubject || !messageBody) {
      alert("Please enter both subject and body for the message.");
      return;
    }

    if (selectedStudents.length === 0) {
      alert("Please select at least one student.");
      return;
    }

    setIsSending(true);

    try {
      const messageRecord = {
        id: Date.now(),
        type: messageType,
        subject: messageSubject,
        body: messageBody,
        priority: priority,
        sentAt: new Date(),
        sentBy: "admin",
        recipients: selectedStudents.length,
        status: "sent",
        studentIds: selectedStudents
      };

      // Save to database
      try {
        await addDoc(collection(db, "communications"), {
          ...messageRecord,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }

      // Update local state
      setAnnouncements(prev => [messageRecord, ...prev]);
      setMessages(prev => [messageRecord, ...prev]);
      
      alert("Message sent successfully!");
      setMessageSubject("");
      setMessageBody("");
      setSelectedStudents([]);
      setShowComposeModal(false);
      setIsSending(false);
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message. Please try again.");
      setIsSending(false);
    }
  };

  // Export communication history
  const exportHistory = () => {
    const csvContent = [
      "Type,Subject,Priority,Recipients,Sent Date,Status",
      ...announcements.map(msg => 
        `"${msg.type}","${msg.subject}","${msg.priority}","${msg.recipients}","${msg.sentAt.toLocaleDateString()}","${msg.status}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `communication_history_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete message
  const deleteMessage = async (messageId) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        setAnnouncements(prev => prev.filter(msg => msg.id !== messageId));
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
        alert("Message deleted successfully!");
      } catch (error) {
        console.error("Error deleting message:", error);
        alert("Error deleting message. Please try again.");
      }
    }
  };

  // Filter messages
  const filteredMessages = announcements.filter(msg => {
    const matchesType = filterType === "all" || msg.type === filterType;
    const matchesSearch = msg.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         msg.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Calculate statistics
  const calculateStats = () => {
    const total = announcements.length;
    const byType = {};
    const byPriority = {};

    announcements.forEach(msg => {
      byType[msg.type] = (byType[msg.type] || 0) + 1;
      byPriority[msg.priority] = (byPriority[msg.priority] || 0) + 1;
    });

    return {
      total,
      byType,
      byPriority,
      totalRecipients: announcements.reduce((sum, msg) => sum + msg.recipients, 0)
    };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-4 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="bg-cyan-500 p-2 rounded-lg">
            <FontAwesomeIcon icon={faEnvelopeOpen} className="text-white text-lg" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Communication Hub</h2>
            <p className="text-gray-600">Manage student communications and announcements</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => setShowComposeModal(true)}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faPlus} className="text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Compose Message</p>
                <p className="text-sm text-gray-600">Send new announcement</p>
              </div>
            </div>
          </button>

          <button
            onClick={selectAllStudents}
            className="p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faUserPlus} className="text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Select All Students</p>
                <p className="text-sm text-gray-600">Choose all students</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className="p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faHistory} className="text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Message History</p>
                <p className="text-sm text-gray-600">View past messages</p>
              </div>
            </div>
          </button>

          <button
            onClick={exportHistory}
            className="p-4 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FontAwesomeIcon icon={faDownload} className="text-orange-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Export History</p>
                <p className="text-sm text-gray-600">Download records</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Communication Statistics</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-gray-600">Total Messages</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">{stats.totalRecipients}</p>
            <p className="text-sm text-gray-600">Total Recipients</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-2xl font-bold text-purple-600">{Object.keys(stats.byType).length}</p>
            <p className="text-sm text-gray-600">Message Types</p>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <p className="text-2xl font-bold text-orange-600">{selectedStudents.length}</p>
            <p className="text-sm text-gray-600">Selected Students</p>
          </div>
        </div>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Select Recipients ({selectedStudents.length} selected)
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={selectAllStudents}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faUserPlus} />
              <span>Select All</span>
            </button>
            <button
              onClick={clearSelection}
              className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
            >
              <FontAwesomeIcon icon={faUndo} />
              <span>Clear</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
          {students.map(student => (
            <div
              key={student.id}
              onClick={() => toggleStudentSelection(student.id)}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                selectedStudents.includes(student.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => toggleStudentSelection(student.id)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {student.rollNo} • {student.department}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              {messageTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search messages..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => setShowComposeModal(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
            >
              <FontAwesomeIcon icon={faPaperPlane} />
              <span>Send Message</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Messages ({filteredMessages.length})
          </h3>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="text-center py-8">
            <FontAwesomeIcon icon={faEnvelopeOpen} className="text-gray-400 text-4xl mb-4" />
            <p className="text-gray-500">No messages found.</p>
            <button
              onClick={() => setShowComposeModal(true)}
              className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 mx-auto"
            >
              <FontAwesomeIcon icon={faPlus} />
              <span>Send First Message</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => {
              const messageTypeInfo = messageTypes.find(t => t.id === message.type);
              const priorityInfo = priorityLevels.find(p => p.id === message.priority);
              
              return (
                <div key={message.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      <div className={`p-2 rounded-lg bg-${messageTypeInfo?.color}-100`}>
                        <FontAwesomeIcon icon={messageTypeInfo?.icon} className={`text-${messageTypeInfo?.color}-600`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">{message.subject}</h4>
                          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-${priorityInfo?.color}-100 text-${priorityInfo?.color}-800`}>
                            {priorityInfo?.name}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{message.body}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Recipients: {message.recipients}</span>
                          <span>Sent: {message.sentAt.toLocaleDateString()}</span>
                          <span>Type: {messageTypeInfo?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => deleteMessage(message.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <FontAwesomeIcon icon={faTrash} className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Compose Message</h3>
                <button
                  onClick={() => setShowComposeModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Type</label>
                  <select
                    value={messageType}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {messageTypes.map(type => (
                      <option key={type.id} value={type.id}>{type.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {priorityLevels.map(level => (
                      <option key={level.id} value={level.id}>{level.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <input
                    type="text"
                    value={messageSubject}
                    onChange={(e) => setMessageSubject(e.target.value)}
                    placeholder="Enter message subject..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Message Body</label>
                  <textarea
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    placeholder="Enter message body..."
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {selectedStudents.length > 0 && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <strong>Recipients:</strong> {selectedStudents.length} students selected
                    </p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={sendMessage}
                    disabled={isSending || !messageSubject || !messageBody || selectedStudents.length === 0}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    <FontAwesomeIcon icon={isSending ? faSpinner : faPaperPlane} className={isSending ? 'animate-spin' : ''} />
                    <span>{isSending ? 'Sending...' : 'Send Message'}</span>
                  </button>
                  <button
                    onClick={() => setShowComposeModal(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunicationHub;

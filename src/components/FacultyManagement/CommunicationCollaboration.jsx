import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments,
  faBell,
  faCalendarAlt,
  faTasks,
  faPlus,
  faEdit,
  faEye,
  faTrash,
  faUserTie,
  faUserCog,
  faUserShield,
  faUserSecret,
  faUserTag,
  faUserLock,
  faUnlock,
  faUserSlash,
  faUserCheck,
  faUserEdit,
  faUserMinus,
  faUserPlus,
  faUserTimes,
  faUserClock,
  faUserGraduate
} from "@fortawesome/free-solid-svg-icons";
import { db } from "../../firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

const CommunicationCollaboration = () => {
  const [activeTab, setActiveTab] = useState("messages");
  const [messages, setMessages] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Fetch messages
    const unsubscribeMessages = onSnapshot(
      collection(db, "messages"),
      (snapshot) => {
        const msgData = [];
        snapshot.forEach((doc) => {
          msgData.push({ id: doc.id, ...doc.data() });
        });
        setMessages(msgData);
      }
    );

    // Fetch announcements
    const unsubscribeAnnouncements = onSnapshot(
      collection(db, "announcements"),
      (snapshot) => {
        const annData = [];
        snapshot.forEach((doc) => {
          annData.push({ id: doc.id, ...doc.data() });
        });
        setAnnouncements(annData);
      }
    );

    // Fetch meetings
    const unsubscribeMeetings = onSnapshot(
      collection(db, "meetings"),
      (snapshot) => {
        const meetingData = [];
        snapshot.forEach((doc) => {
          meetingData.push({ id: doc.id, ...doc.data() });
        });
        setMeetings(meetingData);
      }
    );

    // Fetch tasks
    const unsubscribeTasks = onSnapshot(
      collection(db, "tasks"),
      (snapshot) => {
        const taskData = [];
        snapshot.forEach((doc) => {
          taskData.push({ id: doc.id, ...doc.data() });
        });
        setTasks(taskData);
      }
    );

    return () => {
      unsubscribeMessages();
      unsubscribeAnnouncements();
      unsubscribeMeetings();
      unsubscribeTasks();
    };
  }, []);

  const tabs = [
    { id: "messages", name: "Messages", icon: faComments, count: messages.length },
    { id: "announcements", name: "Announcements", icon: faBell, count: announcements.length },
    { id: "meetings", name: "Meetings", icon: faCalendarAlt, count: meetings.length },
    { id: "tasks", name: "Tasks", icon: faTasks, count: tasks.length }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "messages":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Internal Messaging</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                New Message
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {messages.map((message) => (
                <div key={message.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{message.subject}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      message.priority === "High" ? "bg-red-100 text-red-800" :
                      message.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {message.priority}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>From:</strong> {message.sender}</p>
                    <p><strong>To:</strong> {message.recipient}</p>
                    <p><strong>Date:</strong> {message.sentAt?.toDate().toLocaleDateString()}</p>
                    <p className="text-gray-700">{message.content.substring(0, 100)}...</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-red-600 hover:text-red-900">
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "announcements":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Announcements & Notices</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                New Announcement
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{announcement.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      announcement.category === "Important" ? "bg-red-100 text-red-800" :
                      announcement.category === "General" ? "bg-blue-100 text-blue-800" :
                      "bg-green-100 text-green-800"
                    }`}>
                      {announcement.category}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Posted by:</strong> {announcement.postedBy}</p>
                    <p><strong>Date:</strong> {announcement.postedAt?.toDate().toLocaleDateString()}</p>
                    <p><strong>Target:</strong> {announcement.targetAudience}</p>
                    <p className="text-gray-700">{announcement.content.substring(0, 100)}...</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faBell} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "meetings":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Meeting Scheduler</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Schedule Meeting
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{meeting.title}</h4>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      meeting.status === "Scheduled" ? "bg-blue-100 text-blue-800" :
                      meeting.status === "Completed" ? "bg-green-100 text-green-800" :
                      meeting.status === "Cancelled" ? "bg-red-100 text-red-800" :
                      "bg-yellow-100 text-yellow-800"
                    }`}>
                      {meeting.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><strong>Organizer:</strong> {meeting.organizer}</p>
                    <p><strong>Date:</strong> {meeting.date}</p>
                    <p><strong>Time:</strong> {meeting.time}</p>
                    <p><strong>Location:</strong> {meeting.location}</p>
                    <p><strong>Participants:</strong> {meeting.participants?.length || 0}</p>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-900">
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button className="text-green-600 hover:text-green-900">
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button className="text-yellow-600 hover:text-yellow-900">
                      <FontAwesomeIcon icon={faCalendarAlt} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case "tasks":
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Task & Committee Assignment</h3>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                <FontAwesomeIcon icon={faPlus} className="mr-2" />
                Assign Task
              </button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.assignedTo}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          task.priority === "High" ? "bg-red-100 text-red-800" :
                          task.priority === "Medium" ? "bg-yellow-100 text-yellow-800" :
                          "bg-green-100 text-green-800"
                        }`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          task.status === "Completed" ? "bg-green-100 text-green-800" :
                          task.status === "In Progress" ? "bg-yellow-100 text-yellow-800" :
                          task.status === "Pending" ? "bg-blue-100 text-blue-800" :
                          "bg-red-100 text-red-800"
                        }`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button className="text-blue-600 hover:text-blue-900">
                            <FontAwesomeIcon icon={faEdit} />
                          </button>
                          <button className="text-green-600 hover:text-green-900">
                            <FontAwesomeIcon icon={faEye} />
                          </button>
                          <button className="text-yellow-600 hover:text-yellow-900">
                            <FontAwesomeIcon icon={faTasks} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      default:
        return <div>Select a tab</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Communication & Collaboration</h2>
          <p className="text-gray-600">Manage internal messaging, announcements, meetings, and task assignments</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <FontAwesomeIcon icon={tab.icon} />
                <span>{tab.name}</span>
                <span className="bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default CommunicationCollaboration;

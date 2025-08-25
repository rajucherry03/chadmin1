import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { 
  FaCheck, 
  FaTimes, 
  FaComments, 
  FaClock, 
  FaUser, 
  FaCalendarAlt,
  FaFileAlt,
  FaEye,
  FaEdit,
  FaHistory,
  FaBell,
  FaEnvelope,
  FaWhatsapp
} from 'react-icons/fa';

const ApprovalWorkflow = ({ syllabusId, onStatusChange }) => {
  const [syllabus, setSyllabus] = useState(null);
  const [approvals, setApprovals] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState('');
  const [showHistory, setShowHistory] = useState(false);

  const workflowSteps = [
    {
      id: 'draft',
      name: 'Draft',
      description: 'Initial syllabus draft created',
      role: 'Faculty',
      icon: '📝',
      color: 'bg-gray-100 text-gray-800'
    },
    {
      id: 'dept_review',
      name: 'Department Review',
      description: 'Reviewed by Department Head',
      role: 'HOD',
      icon: '👨‍🏫',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'committee_review',
      name: 'Curriculum Committee',
      description: 'Reviewed by Curriculum Committee',
      role: 'Committee',
      icon: '👥',
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'academic_council',
      name: 'Academic Council',
      description: 'Approved by Academic Council',
      role: 'Council',
      icon: '🏛️',
      color: 'bg-orange-100 text-orange-800'
    },
    {
      id: 'published',
      name: 'Published',
      description: 'Syllabus published and active',
      role: 'Registrar',
      icon: '📢',
      color: 'bg-green-100 text-green-800'
    }
  ];

  useEffect(() => {
    if (syllabusId) {
      fetchSyllabus();
      fetchApprovals();
    }
  }, [syllabusId]);

  const fetchSyllabus = async () => {
    try {
      const syllabusDoc = await getDocs(
        query(collection(db, 'syllabi'), where('id', '==', syllabusId))
      );
      if (!syllabusDoc.empty) {
        const syllabusData = syllabusDoc.docs[0].data();
        setSyllabus(syllabusData);
        setCurrentStep(workflowSteps.findIndex(step => step.id === syllabusData.status));
      }
    } catch (error) {
      console.error('Error fetching syllabus:', error);
    }
  };

  const fetchApprovals = async () => {
    try {
      const approvalsSnapshot = await getDocs(
        query(
          collection(db, 'approvals'),
          where('syllabus_id', '==', syllabusId),
          orderBy('timestamp', 'desc')
        )
      );
      const approvalsData = approvalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setApprovals(approvalsData);
    } catch (error) {
      console.error('Error fetching approvals:', error);
    }
  };

  const submitForApproval = async (nextStep) => {
    setLoading(true);
    try {
      const approvalData = {
        syllabus_id: syllabusId,
        step: nextStep.id,
        approver_id: 'current_user_id', // Replace with actual user ID
        status: 'pending',
        comments: comment,
        timestamp: new Date(),
        evidence_docs: []
      };

      await addDoc(collection(db, 'approvals'), approvalData);

      // Update syllabus status
      await updateDoc(doc(db, 'syllabi', syllabusId), {
        status: nextStep.id,
        updated_at: new Date()
      });

      // Send notifications
      sendNotifications(nextStep);

      setComment('');
      fetchSyllabus();
      fetchApprovals();
      if (onStatusChange) onStatusChange(nextStep.id);
      
      alert(`Syllabus submitted for ${nextStep.name} approval`);
    } catch (error) {
      console.error('Error submitting for approval:', error);
      alert('Error submitting for approval. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const approveStep = async (stepId) => {
    setLoading(true);
    try {
      const approvalData = {
        syllabus_id: syllabusId,
        step: stepId,
        approver_id: 'current_user_id', // Replace with actual user ID
        status: 'approved',
        comments: comment,
        timestamp: new Date(),
        evidence_docs: []
      };

      await addDoc(collection(db, 'approvals'), approvalData);

      // Move to next step or complete
      const currentStepIndex = workflowSteps.findIndex(step => step.id === stepId);
      const nextStep = workflowSteps[currentStepIndex + 1];
      
      if (nextStep) {
        await updateDoc(doc(db, 'syllabi', syllabusId), {
          status: nextStep.id,
          updated_at: new Date()
        });
      }

      setComment('');
      fetchSyllabus();
      fetchApprovals();
      if (onStatusChange) onStatusChange(nextStep ? nextStep.id : 'published');
      
      alert(`Step approved successfully`);
    } catch (error) {
      console.error('Error approving step:', error);
      alert('Error approving step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const rejectStep = async (stepId) => {
    if (!comment.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setLoading(true);
    try {
      const approvalData = {
        syllabus_id: syllabusId,
        step: stepId,
        approver_id: 'current_user_id', // Replace with actual user ID
        status: 'rejected',
        comments: comment,
        timestamp: new Date(),
        evidence_docs: []
      };

      await addDoc(collection(db, 'approvals'), approvalData);

      // Move back to draft
      await updateDoc(doc(db, 'syllabi', syllabusId), {
        status: 'draft',
        updated_at: new Date()
      });

      setComment('');
      fetchSyllabus();
      fetchApprovals();
      if (onStatusChange) onStatusChange('draft');
      
      alert('Syllabus rejected and moved back to draft');
    } catch (error) {
      console.error('Error rejecting step:', error);
      alert('Error rejecting step. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const sendNotifications = (step) => {
    // This would integrate with your notification system
    console.log(`Sending notifications for ${step.name} approval`);
    
    // Example notification data
    const notificationData = {
      type: 'syllabus_approval',
      title: `Syllabus Approval Required - ${step.name}`,
      message: `A syllabus requires your approval for ${step.name} stage`,
      recipients: getRecipientsForStep(step.id),
      syllabus_id: syllabusId,
      step: step.id,
      timestamp: new Date()
    };

    // Send email notifications
    // sendEmailNotification(notificationData);
    
    // Send SMS notifications
    // sendSMSNotification(notificationData);
    
    // Send WhatsApp notifications
    // sendWhatsAppNotification(notificationData);
  };

  const getRecipientsForStep = (stepId) => {
    // This would return the appropriate recipients based on the step
    const recipients = {
      'dept_review': ['hod@university.edu'],
      'committee_review': ['committee@university.edu'],
      'academic_council': ['council@university.edu'],
      'published': ['registrar@university.edu']
    };
    return recipients[stepId] || [];
  };

  const getStepStatus = (stepId) => {
    const stepApprovals = approvals.filter(a => a.step === stepId);
    if (stepApprovals.length === 0) return 'pending';
    
    const latestApproval = stepApprovals[0];
    return latestApproval.status;
  };

  const getStepColor = (stepId) => {
    const status = getStepStatus(stepId);
    const colors = {
      'pending': 'bg-gray-100 text-gray-800',
      'approved': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const canApproveStep = (stepId) => {
    // This would check if current user has permission to approve this step
    const userRole = 'current_user_role'; // Replace with actual user role
    const step = workflowSteps.find(s => s.id === stepId);
    return step && step.role === userRole;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Approval Workflow</h2>
          <p className="text-gray-600">Track and manage syllabus approval process</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2"
          >
            <FaHistory />
            History
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <FaBell />
            Notifications
          </button>
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`flex items-center gap-3 px-4 py-3 rounded-lg ${getStepColor(step.id)}`}>
                <span className="text-2xl">{step.icon}</span>
                <div>
                  <div className="font-semibold">{step.name}</div>
                  <div className="text-sm opacity-75">{step.role}</div>
                </div>
              </div>
              {index < workflowSteps.length - 1 && (
                <div className="w-8 h-0.5 bg-gray-300 mx-2"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Current Status */}
      {syllabus && (
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Current Status</h3>
              <p className="text-gray-600">
                {workflowSteps.find(s => s.id === syllabus.status)?.description}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <FaUser className="text-gray-400" />
              <span className="text-sm text-gray-600">{syllabus.created_by}</span>
              <FaCalendarAlt className="text-gray-400 ml-4" />
              <span className="text-sm text-gray-600">
                {syllabus.updated_at?.toDate?.()?.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Approval Actions */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h3 className="font-semibold text-gray-800 mb-4">Approval Actions</h3>
        
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Comments</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows="3"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Add comments or reasons for approval/rejection..."
          />
        </div>

        <div className="flex gap-4">
          {syllabus && syllabus.status === 'draft' && (
            <button
              onClick={() => submitForApproval(workflowSteps[1])}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaEye />
              Submit for Review
            </button>
          )}

          {syllabus && canApproveStep(syllabus.status) && (
            <>
              <button
                onClick={() => approveStep(syllabus.status)}
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaCheck />
                Approve
              </button>
              <button
                onClick={() => rejectStep(syllabus.status)}
                disabled={loading || !comment.trim()}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
              >
                <FaTimes />
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      {/* Approval History */}
      {showHistory && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-4">Approval History</h3>
          <div className="space-y-4">
            {approvals.map(approval => (
              <div key={approval.id} className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStepColor(approval.step)}`}>
                      {approval.status}
                    </span>
                    <span className="text-sm text-gray-600">
                      {workflowSteps.find(s => s.id === approval.step)?.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaUser />
                    <span>{approval.approver_id}</span>
                    <FaCalendarAlt />
                    <span>{approval.timestamp?.toDate?.()?.toLocaleDateString()}</span>
                  </div>
                </div>
                {approval.comments && (
                  <div className="text-sm text-gray-600 mt-2">
                    <strong>Comments:</strong> {approval.comments}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <div className="mt-6 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Notification Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <input type="checkbox" id="email" defaultChecked />
            <label htmlFor="email" className="text-sm text-blue-700 flex items-center gap-1">
              <FaEnvelope />
              Email Notifications
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="sms" />
            <label htmlFor="sms" className="text-sm text-blue-700 flex items-center gap-1">
              📱 SMS Notifications
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="whatsapp" />
            <label htmlFor="whatsapp" className="text-sm text-blue-700 flex items-center gap-1">
              <FaWhatsapp />
              WhatsApp Notifications
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApprovalWorkflow;

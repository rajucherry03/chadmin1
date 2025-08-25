import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSave,
  faTimes,
  faCopy,
  faEye,
  faChartBar,
  faMoneyBillWave,
  faReceipt,
  faCalculator,
  faDownload
} from '@fortawesome/free-solid-svg-icons';

const FeeStructureManager = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStructure, setEditingStructure] = useState(null);
  const [selectedStructure, setSelectedStructure] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    baseAmount: '',
    categories: [
      { name: 'Tuition Fee', amount: '', percentage: 0 },
      { name: 'Library Fee', amount: '', percentage: 0 },
      { name: 'Laboratory Fee', amount: '', percentage: 0 },
      { name: 'Examination Fee', amount: '', percentage: 0 },
      { name: 'Other Charges', amount: '', percentage: 0 }
    ]
  });

  // Mock data initialization
  useEffect(() => {
    setFeeStructures([
      {
        id: 1,
        name: 'Regular Fee',
        description: 'Standard fee structure for regular students',
        baseAmount: 150000,
        categories: [
          { name: 'Tuition Fee', amount: 100000, percentage: 66.67 },
          { name: 'Library Fee', amount: 5000, percentage: 3.33 },
          { name: 'Laboratory Fee', amount: 15000, percentage: 10 },
          { name: 'Examination Fee', amount: 10000, percentage: 6.67 },
          { name: 'Other Charges', amount: 20000, percentage: 13.33 }
        ],
        applicablePrograms: ['B.Tech', 'B.Sc'],
        applicableYears: ['I', 'II', 'III', 'IV'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-15'
      },
      {
        id: 2,
        name: 'Scholarship Fee',
        description: 'Reduced fee structure for scholarship students',
        baseAmount: 120000,
        categories: [
          { name: 'Tuition Fee', amount: 80000, percentage: 66.67 },
          { name: 'Library Fee', amount: 4000, percentage: 3.33 },
          { name: 'Laboratory Fee', amount: 12000, percentage: 10 },
          { name: 'Examination Fee', amount: 8000, percentage: 6.67 },
          { name: 'Other Charges', amount: 16000, percentage: 13.33 }
        ],
        applicablePrograms: ['B.Tech', 'B.Sc'],
        applicableYears: ['I', 'II', 'III', 'IV'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-10'
      },
      {
        id: 3,
        name: 'Management Quota',
        description: 'Premium fee structure for management quota students',
        baseAmount: 200000,
        categories: [
          { name: 'Tuition Fee', amount: 130000, percentage: 65 },
          { name: 'Library Fee', amount: 8000, percentage: 4 },
          { name: 'Laboratory Fee', amount: 20000, percentage: 10 },
          { name: 'Examination Fee', amount: 15000, percentage: 7.5 },
          { name: 'Other Charges', amount: 27000, percentage: 13.5 }
        ],
        applicablePrograms: ['B.Tech', 'MBA'],
        applicableYears: ['I', 'II', 'III', 'IV'],
        isActive: true,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-20'
      }
    ]);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCategoryChange = (index, field, value) => {
    const updatedCategories = [...formData.categories];
    updatedCategories[index] = {
      ...updatedCategories[index],
      [field]: value
    };

    // Recalculate percentages if base amount is set
    if (formData.baseAmount && field === 'amount') {
      const totalAmount = parseFloat(formData.baseAmount);
      if (totalAmount > 0) {
        updatedCategories[index].percentage = ((parseFloat(value) || 0) / totalAmount * 100).toFixed(2);
      }
    }

    setFormData(prev => ({
      ...prev,
      categories: updatedCategories
    }));
  };

  const calculateTotal = () => {
    return formData.categories.reduce((sum, category) => sum + (parseFloat(category.amount) || 0), 0);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newStructure = {
      id: editingStructure ? editingStructure.id : Date.now(),
      ...formData,
      baseAmount: parseFloat(formData.baseAmount),
      categories: formData.categories.map(cat => ({
        ...cat,
        amount: parseFloat(cat.amount),
        percentage: parseFloat(cat.percentage)
      })),
      isActive: true,
      createdAt: editingStructure ? editingStructure.createdAt : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    if (editingStructure) {
      setFeeStructures(prev => prev.map(s => s.id === editingStructure.id ? newStructure : s));
    } else {
      setFeeStructures(prev => [...prev, newStructure]);
    }

    setShowModal(false);
    setEditingStructure(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      baseAmount: '',
      categories: [
        { name: 'Tuition Fee', amount: '', percentage: 0 },
        { name: 'Library Fee', amount: '', percentage: 0 },
        { name: 'Laboratory Fee', amount: '', percentage: 0 },
        { name: 'Examination Fee', amount: '', percentage: 0 },
        { name: 'Other Charges', amount: '', percentage: 0 }
      ]
    });
  };

  const handleEdit = (structure) => {
    setEditingStructure(structure);
    setFormData({
      name: structure.name,
      description: structure.description,
      baseAmount: structure.baseAmount.toString(),
      categories: structure.categories
    });
    setShowModal(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this fee structure?')) {
      setFeeStructures(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleDuplicate = (structure) => {
    const duplicatedStructure = {
      ...structure,
      id: Date.now(),
      name: `${structure.name} (Copy)`,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setFeeStructures(prev => [...prev, duplicatedStructure]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fee Structure Manager</h1>
          <p className="text-gray-600 mt-2">Manage and configure fee structures for different student categories</p>
        </div>

        {/* Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex space-x-4">
              <button
                onClick={() => setShowModal(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <FontAwesomeIcon icon={faPlus} />
                <span>Add Fee Structure</span>
              </button>
              <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors">
                <FontAwesomeIcon icon={faDownload} />
                <span>Export Structures</span>
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {feeStructures.length} fee structures
            </div>
          </div>
        </div>

        {/* Fee Structures Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeStructures.map((structure) => (
            <div key={structure.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{structure.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{structure.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        structure.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {structure.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedStructure(structure)}
                      className="text-blue-600 hover:text-blue-800"
                      title="View Details"
                    >
                      <FontAwesomeIcon icon={faEye} />
                    </button>
                    <button
                      onClick={() => handleEdit(structure)}
                      className="text-green-600 hover:text-green-800"
                      title="Edit"
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button
                      onClick={() => handleDuplicate(structure)}
                      className="text-purple-600 hover:text-purple-800"
                      title="Duplicate"
                    >
                      <FontAwesomeIcon icon={faCopy} />
                    </button>
                    <button
                      onClick={() => handleDelete(structure.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-gray-800">₹{structure.baseAmount.toLocaleString()}</span>
                    <FontAwesomeIcon icon={faMoneyBillWave} className="text-green-500 text-xl" />
                  </div>
                  <p className="text-sm text-gray-600">Total Amount</p>
                </div>

                <div className="space-y-2 mb-4">
                  {structure.categories.slice(0, 3).map((category, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 truncate">{category.name}</span>
                      <span className="text-sm font-medium text-gray-800">₹{category.amount.toLocaleString()}</span>
                    </div>
                  ))}
                  {structure.categories.length > 3 && (
                    <div className="text-sm text-gray-500 text-center">
                      +{structure.categories.length - 3} more categories
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Applicable Programs</span>
                    <span className="text-gray-800">{structure.applicablePrograms.join(', ')}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm mt-1">
                    <span className="text-gray-600">Last Updated</span>
                    <span className="text-gray-800">{structure.updatedAt}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Structure Details Modal */}
        {selectedStructure && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{selectedStructure.name}</h3>
                <button
                  onClick={() => setSelectedStructure(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">Description</h4>
                  <p className="text-gray-600">{selectedStructure.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Base Amount</h4>
                    <p className="text-2xl font-bold text-gray-800">₹{selectedStructure.baseAmount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Status</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      selectedStructure.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedStructure.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-3">Fee Categories</h4>
                  <div className="space-y-2">
                    {selectedStructure.categories.map((category, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <span className="font-medium text-gray-800">{category.name}</span>
                          <span className="text-sm text-gray-600 ml-2">({category.percentage}%)</span>
                        </div>
                        <span className="font-medium text-gray-800">₹{category.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Applicable Programs</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedStructure.applicablePrograms.map((program, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                          {program}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">Applicable Years</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedStructure.applicableYears.map((year, index) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          {year}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {editingStructure ? 'Edit Fee Structure' : 'Add Fee Structure'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingStructure(null);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FontAwesomeIcon icon={faTimes} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Structure Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter structure name"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Enter description"
                    rows="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Base Amount *</label>
                  <input
                    type="number"
                    name="baseAmount"
                    value={formData.baseAmount}
                    onChange={handleInputChange}
                    placeholder="Enter base amount"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Fee Categories</label>
                  <div className="space-y-3">
                    {formData.categories.map((category, index) => (
                      <div key={index} className="flex space-x-3">
                        <input
                          type="text"
                          value={category.name}
                          readOnly
                          className="flex-1 p-2 border border-gray-300 rounded-lg bg-gray-50"
                        />
                        <input
                          type="number"
                          value={category.amount}
                          onChange={(e) => handleCategoryChange(index, 'amount', e.target.value)}
                          placeholder="Amount"
                          className="w-32 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <div className="w-20 p-2 border border-gray-300 rounded-lg bg-gray-50 text-center">
                          {category.percentage}%
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-blue-800">Total Amount</span>
                      <span className="font-bold text-blue-800">₹{calculateTotal().toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingStructure(null);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    {editingStructure ? 'Update Structure' : 'Create Structure'}
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

export default FeeStructureManager;

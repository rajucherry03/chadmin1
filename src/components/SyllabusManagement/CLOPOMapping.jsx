// TODO: This component needs Django API integration - Firebase imports removed
import React, { useState, useEffect } from 'react';
import { 
  FaTable, 
  FaSave, 
  FaDownload, 
  FaPlus, 
  FaTrash, 
  FaEye,
  FaCheck,
  FaTimes,
  FaChartBar
} from 'react-icons/fa';

const CLOPOMapping = ({ courseId }) => {
  const [clos, setCLOs] = useState([]);
  const [pos, setPOs] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showMatrix, setShowMatrix] = useState(true);

  useEffect(() => {
    if (courseId) {
      fetchCLOs();
      fetchPOs();
      fetchMappings();
    }
  }, [courseId]);

  const fetchCLOs = async () => {
    try {
      const closSnapshot = await getDocs(
        query(collection(db, 'clos'), where('course_id', '==', courseId))
      );
      const closData = closSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCLOs(closData);
    } catch (error) {
      console.error('Error fetching CLOs:', error);
    }
  };

  const fetchPOs = async () => {
    try {
      const posSnapshot = await getDocs(collection(db, 'pos'));
      const posData = posSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPOs(posData);
    } catch (error) {
      console.error('Error fetching POs:', error);
    }
  };

  const fetchMappings = async () => {
    try {
      const mappingsSnapshot = await getDocs(
        query(collection(db, 'clo_po_mappings'), where('course_id', '==', courseId))
      );
      const mappingsData = mappingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMappings(mappingsData);
    } catch (error) {
      console.error('Error fetching mappings:', error);
    }
  };

  const updateMapping = (cloId, poId, weight) => {
    const existingMapping = mappings.find(m => m.clo_id === cloId && m.po_id === poId);
    
    if (existingMapping) {
      if (weight === 0) {
        // Remove mapping if weight is 0
        setMappings(mappings.filter(m => m.id !== existingMapping.id));
      } else {
        // Update existing mapping
        setMappings(mappings.map(m => 
          m.id === existingMapping.id ? { ...m, weight } : m
        ));
      }
    } else if (weight > 0) {
      // Add new mapping
      const newMapping = {
        id: Date.now(),
        clo_id: cloId,
        po_id: poId,
        weight,
        course_id: courseId
      };
      setMappings([...mappings, newMapping]);
    }
  };

  const getMappingWeight = (cloId, poId) => {
    const mapping = mappings.find(m => m.clo_id === cloId && m.po_id === poId);
    return mapping ? mapping.weight : 0;
  };

  const saveMappings = async () => {
    setLoading(true);
    try {
      // Delete existing mappings
      const existingMappings = await getDocs(
        query(collection(db, 'clo_po_mappings'), where('course_id', '==', courseId))
      );
      
      for (const mapping of existingMappings.docs) {
        await deleteDoc(doc(db, 'clo_po_mappings', mapping.id));
      }

      // Add new mappings
      for (const mapping of mappings) {
        await addDoc(collection(db, 'clo_po_mappings'), {
          clo_id: mapping.clo_id,
          po_id: mapping.po_id,
          weight: mapping.weight,
          course_id: courseId,
          created_at: new Date()
        });
      }

      alert('Mappings saved successfully!');
    } catch (error) {
      console.error('Error saving mappings:', error);
      alert('Error saving mappings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportMatrix = () => {
    const csvData = [
      ['CLO/PO', ...pos.map(po => po.code)]
    ];

    clos.forEach(clo => {
      const row = [clo.clo_code];
      pos.forEach(po => {
        const weight = getMappingWeight(clo.id, po.id);
        row.push(weight.toString());
      });
      csvData.push(row);
    });

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'clo-po-mapping.csv';
    a.click();
  };

  const getWeightColor = (weight) => {
    if (weight === 0) return 'bg-gray-100';
    if (weight <= 0.3) return 'bg-yellow-100';
    if (weight <= 0.6) return 'bg-orange-100';
    return 'bg-green-100';
  };

  const getWeightTextColor = (weight) => {
    if (weight === 0) return 'text-gray-500';
    if (weight <= 0.3) return 'text-yellow-800';
    if (weight <= 0.6) return 'text-orange-800';
    return 'text-green-800';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">CLO-PO Mapping Matrix</h2>
          <p className="text-gray-600">Map Course Learning Outcomes to Program Outcomes</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowMatrix(!showMatrix)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            {showMatrix ? <FaEye /> : <FaTable />}
            {showMatrix ? 'View Matrix' : 'Edit Matrix'}
          </button>
          <button
            onClick={saveMappings}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
          >
            <FaSave />
            Save
          </button>
          <button
            onClick={exportMatrix}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <FaDownload />
            Export
          </button>
        </div>
      </div>

      {showMatrix ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">CLO/PO</th>
                {pos.map(po => (
                  <th key={po.id} className="border border-gray-300 px-4 py-3 text-center font-semibold">
                    {po.code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clos.map(clo => (
                <tr key={clo.id}>
                  <td className="border border-gray-300 px-4 py-3 font-medium bg-gray-50">
                    {clo.clo_code}
                  </td>
                  {pos.map(po => {
                    const weight = getMappingWeight(clo.id, po.id);
                    return (
                      <td key={po.id} className="border border-gray-300 px-4 py-3 text-center">
                        <select
                          value={weight}
                          onChange={(e) => updateMapping(clo.id, po.id, parseFloat(e.target.value))}
                          className={`w-full px-2 py-1 rounded text-center font-medium ${getWeightColor(weight)} ${getWeightTextColor(weight)}`}
                        >
                          <option value={0}>0</option>
                          <option value={0.1}>0.1</option>
                          <option value={0.2}>0.2</option>
                          <option value={0.3}>0.3</option>
                          <option value={0.4}>0.4</option>
                          <option value={0.5}>0.5</option>
                          <option value={0.6}>0.6</option>
                          <option value={0.7}>0.7</option>
                          <option value={0.8}>0.8</option>
                          <option value={0.9}>0.9</option>
                          <option value={1.0}>1.0</option>
                        </select>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* CLOs List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Course Learning Outcomes</h3>
            <div className="space-y-3">
              {clos.map(clo => (
                <div key={clo.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="font-medium text-gray-800">{clo.clo_code}</div>
                  <div className="text-sm text-gray-600 mt-1">{clo.description}</div>
                  <div className="text-xs text-gray-500 mt-1">Bloom Level: {clo.bloom_level}</div>
                </div>
              ))}
            </div>
          </div>

          {/* POs List */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Program Outcomes</h3>
            <div className="space-y-3">
              {pos.map(po => (
                <div key={po.id} className="bg-white rounded-lg p-3 shadow-sm">
                  <div className="font-medium text-gray-800">{po.code}</div>
                  <div className="text-sm text-gray-600 mt-1">{po.description}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FaChartBar className="text-blue-600" />
            <span className="font-semibold text-blue-800">Total CLOs</span>
          </div>
          <div className="text-2xl font-bold text-blue-600 mt-2">{clos.length}</div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FaCheck className="text-green-600" />
            <span className="font-semibold text-green-800">Total POs</span>
          </div>
          <div className="text-2xl font-bold text-green-600 mt-2">{pos.length}</div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FaTable className="text-purple-600" />
            <span className="font-semibold text-purple-800">Mappings</span>
          </div>
          <div className="text-2xl font-bold text-purple-600 mt-2">{mappings.length}</div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <FaTimes className="text-orange-600" />
            <span className="font-semibold text-orange-800">Coverage</span>
          </div>
          <div className="text-2xl font-bold text-orange-600 mt-2">
            {pos.length > 0 ? Math.round((mappings.length / (clos.length * pos.length)) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  );
};

export default CLOPOMapping;

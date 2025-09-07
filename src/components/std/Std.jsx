import React, { useEffect, useMemo, useState } from 'react';
import studentApiService from '../../services/studentApiService';
import { DJANGO_BASE_URL } from '../../config/apiConfig';

const Std = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [debug, setDebug] = useState({});

  const filters = useMemo(() => ({ search, department, year, section, status, page, page_size: pageSize }), [search, department, year, section, status, page, pageSize]);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await studentApiService.getStudents(filters);
        const list = Array.isArray(data) ? data : (data?.results || data || []);
        setRows(Array.isArray(list) ? list : []);
      } catch (e) {
        setError(e.message || 'Failed to fetch students');
        setRows([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [filters]);

  const runDirectTest = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (department) params.append('department', department);
      if (year) params.append('year', year);
      if (section) params.append('section', section);
      if (status) params.append('status', status);
      params.append('page', String(page));
      params.append('page_size', String(pageSize));

      const url = `${DJANGO_BASE_URL}/v1/students/students/${params.toString() ? `?${params.toString()}` : ''}`;
      const token = localStorage.getItem('django_token') || localStorage.getItem('access_token');
      const res = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      let body = null;
      try { body = await res.json(); } catch (_) {}
      setDebug({ url, status: res.status, ok: res.ok, body, tokenPresent: !!token });
      if (!res.ok) throw new Error(body?.detail || body?.message || `HTTP ${res.status}`);
      const list = Array.isArray(body) ? body : (body?.results || body || []);
      setRows(Array.isArray(list) ? list : []);
    } catch (e) {
      setError(e.message || 'Direct test failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students</h1>

      <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
        <input value={search} onChange={(e)=>{ setPage(1); setSearch(e.target.value); }} placeholder="Search" className="px-3 py-2 border rounded md:col-span-2" />
        <select value={department} onChange={(e)=>{ setPage(1); setDepartment(e.target.value); }} className="px-3 py-2 border rounded">
          <option value="">Department</option>
          <option value="CSE">CSE</option>
          <option value="ECE">ECE</option>
          <option value="ME">ME</option>
          <option value="CE">CE</option>
        </select>
        <select value={year} onChange={(e)=>{ setPage(1); setYear(e.target.value); }} className="px-3 py-2 border rounded">
          <option value="">Year</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
        <select value={section} onChange={(e)=>{ setPage(1); setSection(e.target.value); }} className="px-3 py-2 border rounded">
          <option value="">Section</option>
          <option value="A">A</option>
          <option value="B">B</option>
          <option value="C">C</option>
          <option value="D">D</option>
        </select>
        <select value={status} onChange={(e)=>{ setPage(1); setStatus(e.target.value); }} className="px-3 py-2 border rounded">
          <option value="">Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <div className="mb-4 flex items-center space-x-2">
        <button onClick={runDirectTest} className="px-3 py-2 border rounded">Run direct test</button>
        {debug.url && (
          <div className="text-xs text-gray-600 truncate">{debug.status} {debug.ok ? 'OK' : 'ERR'} — {debug.url}</div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Roll</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dept/Year/Sec</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {rows.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 text-sm">{s.id}</td>
                    <td className="px-4 py-3 text-sm">{s.name || `${s.first_name || ''} ${s.last_name || ''}`.trim() || '—'}</td>
                    <td className="px-4 py-3 text-sm">{s.email || '—'}</td>
                    <td className="px-4 py-3 text-sm">{s.roll_number || '—'}</td>
                    <td className="px-4 py-3 text-sm">{[s.department, s.year, s.section].filter(Boolean).join(' / ') || '—'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        s.status === 'active' ? 'bg-green-100 text-green-700' :
                        s.status === 'inactive' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>{s.status || 'unknown'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} className="px-3 py-2 border rounded">Prev</button>
            <div className="flex items-center space-x-2">
              <span className="text-sm">Page {page}</span>
              <select value={pageSize} onChange={(e)=>{ setPage(1); setPageSize(Number(e.target.value)); }} className="px-2 py-1 border rounded">
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
            <button onClick={() => setPage(p => p + 1)} className="px-3 py-2 border rounded">Next</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Std;



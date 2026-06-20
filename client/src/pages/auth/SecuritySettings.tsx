import { useState, useEffect } from 'react';
import api from '../../lib/axios';

interface Session {
  _id: string;
  os: string;
  browser: string;
  ipAddress: string;
  createdAt: string;
  lastActivity: string;
}

const SecuritySettings = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/auth/active-sessions');
      setSessions(res.data.data);
    } catch (error) {
      console.error('Error fetching sessions', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const revokeSession = async (sessionId: string) => {
    try {
      await api.delete(`/auth/revoke-session/${sessionId}`);
      setSessions(sessions.filter(s => s._id !== sessionId));
    } catch (error) {
      console.error('Error revoking session', error);
    }
  };

  const logoutAll = async () => {
    try {
      await api.post('/auth/logout-all');
      setSessions([]);
      // Should likely redirect to login next
      window.location.href = '/login';
    } catch (error) {
      console.error('Error logging out all sessions', error);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500 mt-2">Manage your account security and active sessions.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">Active Sessions</h2>
            <p className="text-sm text-gray-500">You are currently logged in to these devices.</p>
          </div>
          <button 
            onClick={logoutAll}
            className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg font-medium transition-colors text-sm"
          >
            Logout All Devices
          </button>
        </div>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-gray-500">No active sessions found.</p>
        ) : (
          <div className="space-y-4">
            {sessions.map(session => (
              <div key={session._id} className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:shadow-sm transition-shadow bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{session.os || 'Unknown Device'} - {session.browser || 'Unknown Browser'}</h3>
                    <p className="text-sm text-gray-500">IP: {session.ipAddress} • Last active: {new Date(session.lastActivity).toLocaleString()}</p>
                  </div>
                </div>
                <button 
                  onClick={() => revokeSession(session._id)}
                  className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  Revoke Access
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SecuritySettings;

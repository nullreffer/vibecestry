import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './FlowList.css';

const FlowList = () => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFlows();
  }, []);

  const fetchFlows = async () => {
    try {
      setLoading(true);
      // For now, we'll use mock data. You can replace this with actual API calls
      const mockFlows = [
        {
          id: '1',
          name: 'Sample Flow 1',
          description: 'A sample flow for demonstration',
          nodeCount: 5,
          edgeCount: 4,
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-16T14:20:00Z'
        },
        {
          id: '2',
          name: 'Data Processing Flow',
          description: 'Flow for processing user data',
          nodeCount: 8,
          edgeCount: 7,
          createdAt: '2024-01-14T09:15:00Z',
          updatedAt: '2024-01-15T11:45:00Z'
        },
        {
          id: '3',
          name: 'Workflow Automation',
          description: 'Automated workflow for task management',
          nodeCount: 12,
          edgeCount: 15,
          createdAt: '2024-01-13T16:20:00Z',
          updatedAt: '2024-01-14T08:30:00Z'
        }
      ];
      
      setFlows(mockFlows);
      setError(null);
    } catch (err) {
      setError('Failed to fetch flows');
      console.error('Error fetching flows:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (flowId) => {
    if (window.confirm('Are you sure you want to delete this flow?')) {
      try {
        // Here you would make an API call to delete the flow
        setFlows(flows.filter(flow => flow.id !== flowId));
      } catch (err) {
        setError('Failed to delete flow');
        console.error('Error deleting flow:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flow-list-container">
        <div className="loading">Loading flows...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flow-list-container">
        <div className="error">{error}</div>
        <button onClick={fetchFlows} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flow-list-container">
      {flows.length === 0 ? (
        <div className="empty-state">
          <h3>No Ancestry Charts Yet</h3>
          <p>Start building your family tree by creating your first chart.</p>
          <Link to="/add" className="cta-button">
            Create Your First Chart
          </Link>
        </div>
      ) : (
        <div className="flows-grid">
          {flows.map((flow) => (
            <div key={flow.id} className="flow-card">
              <div className="flow-card-header">
                <h3>{flow.name}</h3>
                <div className="flow-actions">
                  <Link 
                    to={`/edit/${flow.id}`} 
                    className="edit-button"
                    title="Edit flow"
                  >
                    ✏️
                  </Link>
                  <button 
                    onClick={() => handleDelete(flow.id)}
                    className="delete-button"
                    title="Delete flow"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="flow-card-body">
                <p className="flow-description">{flow.description}</p>
                
                <div className="flow-stats">
                  <span className="stat">
                    <strong>{flow.nodeCount}</strong> nodes
                  </span>
                  <span className="stat">
                    <strong>{flow.edgeCount}</strong> edges
                  </span>
                </div>
                
                <div className="flow-meta">
                  <div className="meta-item">
                    <small>Created: {formatDate(flow.createdAt)}</small>
                  </div>
                  <div className="meta-item">
                    <small>Updated: {formatDate(flow.updatedAt)}</small>
                  </div>
                </div>
              </div>
              
              <div className="flow-card-footer">
                <Link 
                  to={`/edit/${flow.id}`} 
                  className="open-button"
                >
                  Open Flow
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlowList;

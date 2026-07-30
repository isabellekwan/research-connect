import { useState } from 'react';
import type { Study } from '../../../types';

interface StudySelectorProps {
    studies: Study[];
    selectedStudyId: string | null;
    onSelectStudy: (id: string | null) => void;
}

export const StudySelector = ({ studies, selectedStudyId, onSelectStudy }: StudySelectorProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    // Pagination logic
    const totalPages = Math.ceil(studies.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentStudies = studies.slice(startIndex, startIndex + itemsPerPage);

    return (
        <div className="study-list-container">
            <div className="study-list-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>Your Posted Studies</h3>
                <button 
                className={`pagination-btn ${selectedStudyId === null ? 'active' : ''}`}
                onClick={() => onSelectStudy(null)}
                style={{ 
                    backgroundColor: selectedStudyId === null ? 'var(--accent-main)' : 'var(--bg-main)',
                    color: selectedStudyId === null ? '#fff' : 'var(--text-primary)'
                }}
                >
                All Studies Overview
                </button>
            </div>
            
            <div className="study-list">
                {currentStudies.map((study) => (
                <div 
                    key={study.id} 
                    className={`study-item ${selectedStudyId === study.id ? 'active' : ''}`}
                    onClick={() => onSelectStudy(study.id)}
                >
                    <span className="study-title">{study.title}</span>
                    <span className="study-date">{new Date(study.created_at).toLocaleDateString()}</span>
                    <span className="study-status">{study.status}</span>
                </div>
                ))}
            </div>

            <div className="pagination-controls">
                <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                >
                    Previous
                </button>
                
                <span style={{ color: 'var(--text-secondary)' }}>
                Page {currentPage} of {totalPages}
                </span>

                <button 
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                >
                    Next
                </button>
            </div>
        </div>
    );
};
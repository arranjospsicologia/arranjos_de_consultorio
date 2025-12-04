import React from 'react';
import './LoadingSkeleton.css';

export const TableSkeleton = ({ rows = 5, columns = 5 }) => {
  return (
    <div className="skeleton-table" role="status" aria-label="Carregando...">
      <div className="skeleton-table-header">
        {[...Array(columns)].map((_, i) => (
          <div key={i} className="skeleton skeleton-header" />
        ))}
      </div>
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table-row">
          {[...Array(columns)].map((_, colIndex) => (
            <div key={colIndex} className="skeleton skeleton-cell" />
          ))}
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = () => {
  return (
    <div className="skeleton-card" role="status" aria-label="Carregando...">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-text" />
      <div className="skeleton skeleton-text short" />
    </div>
  );
};

export const ListSkeleton = ({ items = 5 }) => {
  return (
    <div className="skeleton-list" role="status" aria-label="Carregando...">
      {[...Array(items)].map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton skeleton-circle" />
          <div className="skeleton-list-content">
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text short" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const Spinner = ({ size = 'md' }) => {
  return (
    <div className={`spinner spinner-${size}`} role="status" aria-label="Carregando...">
      <div className="spinner-border"></div>
    </div>
  );
};

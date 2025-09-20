import React from 'react';

interface CardProps {
  title: string;
  value: string;
  description: string;
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ title, value, description, children }) => {
  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 flex flex-col justify-between hover:bg-slate-700 transition-colors duration-200">
      <div>
        <div className="flex items-center">
            {children}
            <h3 className="text-lg font-semibold text-slate-300 ml-3">{title}</h3>
        </div>
        <p className="text-4xl font-bold text-white mt-4">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{description}</p>
      </div>
    </div>
  );
};

export default Card;
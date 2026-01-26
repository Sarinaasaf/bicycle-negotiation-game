import React from 'react';

const groups = [
  {
    id: 1,
    batnaA: 0,
    batnaB: 0,
    bgColor: 'bg-blue-500',
    color: 'from-blue-500 to-blue-400',
  },
  {
    id: 2,
    batnaA: 0,
    batnaB: 250,
    bgColor: 'bg-green-500',
    color: 'from-green-500 to-green-400',
  },
  {
    id: 3,
    batnaA: 0,
    batnaB: 500,
    bgColor: 'bg-orange-500',
    color: 'from-orange-500 to-orange-400',
  },
  {
    id: 4,
    batnaA: 0,
    batnaB: 750,
    bgColor: 'bg-red-500',
    color: 'from-red-500 to-red-400',
  },
  {
    id: 5,
    batnaA: 250,
    batnaB: 0,
    bgColor: 'bg-indigo-500',
    color: 'from-indigo-500 to-indigo-400',
  },
  {
    id: 6,
    batnaA: 500,
    batnaB: 0,
    bgColor: 'bg-pink-500',
    color: 'from-pink-500 to-pink-400',
  },
  {
    id: 7,
    batnaA: 750,
    batnaB: 0,
    bgColor: 'bg-yellow-500',
    color: 'from-yellow-500 to-yellow-400',
  },
];

export default function GroupSelection() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
      {groups.map((group) => (
        <div
          key={group.id}
          className={`p-4 rounded-lg text-white ${group.bgColor}`}
        >
          <h2 className="text-lg font-bold">Gruppe {group.id}</h2>
          <p>BATNA A: {group.batnaA} €</p>
          <p>BATNA B: {group.batnaB} €</p>
        </div>
      ))}
    </div>
  );
}

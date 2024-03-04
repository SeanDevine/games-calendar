import React from 'react';
import { useParams } from 'react-router-dom';

const GameDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Game Details for ID: {id}</h2>
    </div>
  );
};

export { GameDetails };

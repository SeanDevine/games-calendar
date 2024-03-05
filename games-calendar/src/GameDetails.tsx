import React from 'react';

const GameDetails = ({ match }) => {
  const gameId = match.params.id;

  return (
    <div>
      <h2>Game Details for ID: {gameId}</h2>
      {/* TODO: Add game details */}
    </div>
  );
};

export default GameDetails;

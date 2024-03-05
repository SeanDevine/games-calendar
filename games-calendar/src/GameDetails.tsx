import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const apiKey = 'c9bf349e90a04c5f852186b91ab54688';
const apiUrl = 'https://api.rawg.io/api/';

const GameDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [gameDetails, setGameDetails] = useState<any>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}games/${id}?key=${apiKey}`);

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setGameDetails(data);
      } catch (error) {
        console.error('Error fetching game details:', error);
      }
    };

    fetchGameDetails();
  }, [id]);

  return (
    <div>
      {gameDetails && (
        <div>
          <div style={{ display: 'flex' }}>
            <div style={{ flex: '1 0 40%', paddingRight: '20px' }}>
              <img src={gameDetails.background_image} alt={gameDetails.name} style={{ width: '100%', maxHeight: '300px', objectFit: 'cover' }} />
            </div>
            <div style={{ flex: '1 0 60%' }}>
              <h2>{gameDetails.name}</h2>
              <p><strong>Release Date:</strong> {gameDetails.released}</p>
              <p><strong>Platforms:</strong> {gameDetails.platforms.map((platform: any) => platform.platform.name).join(', ')}</p>
            </div>
          </div>
          <div>
            <h6>Description</h6>
            <p>{gameDetails.description_raw}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameDetails;

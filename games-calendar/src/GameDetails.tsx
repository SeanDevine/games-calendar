import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FlexboxGrid, Button } from 'rsuite';
import placeholderImage from './assets/gamecard_placeholder.jpg';

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
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {gameDetails && (
        <div className='gameDetails-container' style={{ position: 'relative' }}>
          <Button style={{ margin: '10px 0'}}><a href='javascript:window.history.back()'>Back</a></Button>
          <img className='gameImage' src={gameDetails.background_image ? gameDetails.background_image : placeholderImage} alt={gameDetails.name} style={{ width: '100%' }} />
          <h4 className='gameTitle'>{gameDetails.name}</h4>
          <div style={{ display: 'flex', alignItems: 'center', paddingBottom: '10px' }}> {/* Added alignItems: 'center' to align items vertically */}
            {gameDetails.released && (
              <span className='labelText'><strong className='labelName'>Release Date:</strong> {gameDetails.released}</span>
            )}
            <span className='labelText' style={{ marginLeft: '15px' }}><strong className='labelName'>Platforms:</strong> {gameDetails.platforms.map((platform: any) => platform.platform.name).join(', ')}</span>
          </div>
          {gameDetails.description_raw && (
            <div>
              <p className='labelText labelName'>Description:</p>
              <p style={{ paddingBottom: '10px' }}>{gameDetails.description_raw}</p>
            </div>
          )}
          {!gameDetails.description_raw && (
            <p className='labelText labelName'>No description available</p>
          )}
        </div>
      )}
    </div>
  );
};

export default GameDetails;

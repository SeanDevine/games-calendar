import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Header, Content, Footer, Sidebar, FlexboxGrid } from 'rsuite';
import FlexboxGridItem from 'rsuite/esm/FlexboxGrid/FlexboxGridItem';

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
    <FlexboxGrid justify='center'>
      <FlexboxGridItem colspan={18}>
        {gameDetails && (
          <div>
            <div style={{ display: 'flex' }}>
              <div style={{ flex: '1 0 40%', paddingRight: '20px' }}>
                <img className='gameImage' src={gameDetails.background_image} alt={gameDetails.name}/>
              </div>
              <div style={{ flex: '1 0 60%' }}>
                <h2 className='gameTitle'>{gameDetails.name}</h2>
                <p className='labelText'><strong className='labelName'>Release Date:</strong> {gameDetails.released}</p>
                <p className='labelText'><strong className='labelName'>Platforms:</strong> {gameDetails.platforms.map((platform: any) => platform.platform.name).join(', ')}</p>
                <p className='labelText labelName'>Description:</p>
                <p>{gameDetails.description_raw}</p>
              </div>
            </div>
          </div>
        )}
      </FlexboxGridItem>
    </FlexboxGrid>
  );
};

export default GameDetails;

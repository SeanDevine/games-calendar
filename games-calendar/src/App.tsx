import { Calendar, Badge, Popover, Whisper } from 'rsuite';
import { useState, useEffect } from 'react';

const apiKey = 'c9bf349e90a04c5f852186b91ab54688';
const apiUrl = 'https://api.rawg.io/api/';

// Function to fetch data from RAWG API and set popular games in state
async function fetchPopularGames(startDate, endDate) {
  try {
    const response = await fetch(`${apiUrl}games?key=${apiKey}&dates=${startDate.toISOString().split('T')[0]},${endDate.toISOString().split('T')[0]}&ordering=-added`);

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching data:', error);
    return [];
  }
}

const App = () => {
  const [popularGames, setPopularGames] = useState([]);
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  useEffect(() => {
    fetchGamesForVisibleRange();
  }, [visibleMonth]);

  async function fetchGamesForVisibleRange() {
    // Calculate the start and end dates for the visible month
    const startDate = new Date(visibleMonth);
    startDate.setDate(1); // Set to first day of the month
    const endDate = new Date(visibleMonth);
    endDate.setMonth(endDate.getMonth() + 1, 0); // Set to last day of the month

    const games = await fetchPopularGames(startDate, endDate);
    setPopularGames(games);
  }

  function handleCalendarChange(date) {
    setVisibleMonth(date);
  }

  function getGameTitles(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Months are zero-indexed, so we add 1
    const year = date.getFullYear();
    const gamesForDay = popularGames.filter(game => {
      const gameReleaseDate = new Date(game.released);
      const gameReleaseDay = gameReleaseDate.getDate();
      const gameReleaseMonth = gameReleaseDate.getMonth() + 1; // Months are zero-indexed, so we add 1
      const gameReleaseYear = gameReleaseDate.getFullYear();
  
      // Check if the game release date matches the current date in the calendar
      return gameReleaseDay === day && gameReleaseMonth === month && gameReleaseYear === year;
    });
  
    return gamesForDay.map(game => game.name);
  }

  function renderCell(date) {
    const gameTitles = getGameTitles(date);

    if (gameTitles.length) {
      return (
        <ul className="calendar-game-list">
          {gameTitles.map((title, index) => (
            <li key={index}>
              <Badge /> {title}
            </li>
          ))}
        </ul>
      );
    }

    return null;
  }

  return (
    <Calendar
      bordered
      renderCell={renderCell}
      onChange={handleCalendarChange}
      value={visibleMonth}
    />
  );
};

export default App;

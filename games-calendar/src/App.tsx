import { Calendar, Whisper, Popover, Button } from 'rsuite';
import { useState, useEffect } from 'react';

const apiKey = 'c9bf349e90a04c5f852186b91ab54688';
const apiUrl = 'https://api.rawg.io/api/';

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
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'

  useEffect(() => {
    fetchGamesForVisibleRange();
  }, [visibleMonth, view]);

  async function fetchGamesForVisibleRange() {
    const startDate = new Date(visibleMonth);
    startDate.setDate(1);
    const endDate = new Date(visibleMonth);
    endDate.setMonth(endDate.getMonth() + 1, 0);

    const games = await fetchPopularGames(startDate, endDate);
    setPopularGames(games);
  }

  function handleCalendarChange(date) {
    setVisibleMonth(date);
  }

  function toggleView() {
    setView(view === 'calendar' ? 'list' : 'calendar');
  }

  function getGameTitles(date) {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const gamesForDay = popularGames.filter(game => {
      const gameReleaseDate = new Date(game.released);
      const gameReleaseDay = gameReleaseDate.getDate();
      const gameReleaseMonth = gameReleaseDate.getMonth() + 1;
      const gameReleaseYear = gameReleaseDate.getFullYear();

      return gameReleaseDay === day && gameReleaseMonth === month && gameReleaseYear === year;
    });

    return gamesForDay.map(game => game.name);
  }

  function renderCell(date) {
    const gameTitles = getGameTitles(date);
    const displayList = gameTitles.slice(0, 2);
    const moreCount = gameTitles.length - displayList.length;

    if (gameTitles.length > 2) {
      const moreItem = (
        <Whisper
          placement="top"
          trigger="click"
          speaker={
            <Popover>
              {gameTitles.map((title, index) => (
                <p key={index}>{title}</p>
              ))}
            </Popover>
          }
        >
          <Button>{moreCount} more</Button>
        </Whisper>
      );

      return (
        <div className="calendar-cell">
          {displayList.map((title, index) => (
            <div key={index}>{title}</div>
          ))}
          {moreItem}
        </div>
      );
    } else if (gameTitles.length > 0) {
      return (
        <div className="calendar-cell">
          {displayList.map((title, index) => (
            <div key={index}>{title}</div>
          ))}
        </div>
      );
    } else {
      return null;
    }
  }

  return (
    <div>
      <Button onClick={toggleView}>{view === 'calendar' ? 'List View' : 'Calendar View'}</Button>
      {view === 'calendar' ? (
        <Calendar
          bordered
          renderCell={renderCell}
          onChange={handleCalendarChange}
          value={visibleMonth}
        />
      ) : (
        <div>List View</div>
      )}
    </div>
  );
};

export default App;

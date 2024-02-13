import { Calendar, Whisper, Popover, Button, ButtonGroup, Panel } from 'rsuite';
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

  // Function to get the sections for each week in the month
  function getWeekSections() {
    const weeks = [];
    const firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    let currentDay = new Date(firstDayOfMonth);
  
    while (currentDay <= lastDayOfMonth) {
      // Find the start of the current week (Sunday)
      const startOfWeek = new Date(currentDay);
      startOfWeek.setDate(currentDay.getDate() - currentDay.getDay());
  
      // Find the end of the current week (Saturday)
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
  
      // Add the current week to the list
      weeks.push({ start: new Date(startOfWeek), end: new Date(endOfWeek) });
  
      // Move to the next week
      currentDay = new Date(endOfWeek);
      currentDay.setDate(currentDay.getDate() + 1);
    }
  
    return weeks;
  }
  
  

  // Function to generate cards for games
  function renderGameCards(games) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {games.map(game => (
          <Panel key={game.id} shaded bordered bodyFill style={{ width: 240, margin: 10 }}>
            <div style={{ flex: '1 0 auto' }}>
              <img src={game.background_image} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
            </div>
            <Panel header={game.name} style={{ height: 120, overflow: 'hidden' }}>
              <p style={{ margin: 0, alignSelf: 'flex-end' }}>Release Date: {game.released}</p>
            </Panel>
          </Panel>
        ))}
      </div>
    );
  }
  
  
  

  // Function to render the list view
  function renderListView() {
    const weeks = getWeekSections();
  
    return (
      <div>
        <ButtonGroup size="lg" style={{ marginBottom: 10 }}>
          <Button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1))}>Previous Month</Button>
          <Button>{visibleMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</Button>
          <Button onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1))}>Next Month</Button>
        </ButtonGroup>
        {weeks.map(week => (
          <div key={week.start}>
            <h4>{week.start.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {week.end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</h4>
            <div>{renderGameCards(popularGames.filter(game => new Date(game.released) >= week.start && new Date(game.released) <= week.end))}</div>
          </div>
        ))}
      </div>
    );
  }
  
  

  function renderCell(date) {
    // Check if popularGames is empty and return an empty array if it is
    if (popularGames.length === 0) {
      return null;
    }
  
    const gameTitles = getGameTitles(date);
  
    // Check if the date is within the visible month
    if (
      date.getMonth() === visibleMonth.getMonth() &&
      date.getFullYear() === visibleMonth.getFullYear()
    ) {
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
    } else {
      return null; // Return null for dates outside the visible month
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
        renderListView()
      )}
    </div>
  );
};

export default App;

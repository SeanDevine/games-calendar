import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { Calendar, Whisper, Popover, Button, ButtonGroup, Panel } from 'rsuite';

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

const GameDetails = () => {
  const { id } = useParams();

  return (
    <div>
      <h2>Game Details for ID: {id}</h2>
      {/* Fetch and display game details using the id */}
    </div>
  );
};

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

  function renderCell(date) {
    if (popularGames.length === 0) {
      return null;
    }
  
    const gameTitles = getGameTitles(date);
  
    if (
      date.getMonth() === visibleMonth.getMonth() &&
      date.getFullYear() === visibleMonth.getFullYear()
    ) {
      const displayList = gameTitles.slice(0, 2);
  
      if (gameTitles.length > 2) {
        const moreItem = (
          <Whisper
            placement="top"
            trigger="click"
            speaker={
              <Popover>
                {gameTitles.map((title, index) => (
                  <p key={index}>
                    <Link to={`/game/${title}`} style={{ color: 'inherit' }}>{title}</Link>
                  </p>
                ))}
              </Popover>
            }
          >
            <Button>See All</Button>
          </Whisper>
        );
  
        return (
          <div className="calendar-cell">
            {displayList.map((title, index) => (
              <div key={index}>
                <Link to={`/game/${title}`} style={{ color: 'inherit' }}>{title}</Link>
              </div>
            ))}
            {moreItem}
          </div>
        );
      } else if (gameTitles.length > 0) {
        return (
          <div className="calendar-cell">
            {displayList.map((title, index) => (
              <div key={index}>
                <Link to={`/game/${title}`} style={{ color: 'inherit' }}>{title}</Link>
              </div>
            ))}
          </div>
        );
      } else {
        return null;
      }
    } else {
      return null;
    }
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

  function renderGameCards(games) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap' }}>
        {games.map(game => (
          <Link to={`/game/${game.name}`} style={{ textDecoration: 'none' }}>
          <Panel key={game.id} shaded bordered bodyFill style={{ width: 240, margin: 10 }}>
            <div style={{ flex: '1 0 auto' }}>
              <img src={game.background_image} style={{ width: '100%', height: 240, objectFit: 'cover' }} />
            </div>
            <Panel header={game.name} style={{ height: 120, overflow: 'hidden' }}>
              <p style={{ margin: 0, alignSelf: 'flex-end' }}>Release Date: {game.released}</p>
            </Panel>
          </Panel>
          </Link>
        ))}
      </div>
    );
  }

  function getWeekSections() {
    const weeks = [];
    const firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
    const lastDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0);
    let currentDay = new Date(firstDayOfMonth);
  
    while (currentDay <= lastDayOfMonth) {
      const startOfWeek = new Date(currentDay);
      startOfWeek.setDate(currentDay.getDate() - currentDay.getDay());
  
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
  
      weeks.push({ start: new Date(startOfWeek), end: new Date(endOfWeek) });
  
      currentDay = new Date(endOfWeek);
      currentDay.setDate(currentDay.getDate() + 1);
    }
  
    return weeks;
  }

  return (
    <Router>
      <div>
        {/* Define routes */}
        <Routes>
          <Route path="/" element={view === 'calendar' ? (
            <div>
              <Button onClick={toggleView}>{view === 'calendar' ? 'List View' : 'Calendar View'}</Button>
              <Calendar
                bordered
                renderCell={renderCell}
                onChange={handleCalendarChange}
                value={visibleMonth}
              />
            </div>
          ) : (
            <div>
              <Button onClick={toggleView}>{view === 'calendar' ? 'List View' : 'Calendar View'}</Button>
              {renderListView()}
            </div>
          )} />
          <Route path="/game/:id" element={<GameDetails />} /> {/* Route for GameDetails */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;

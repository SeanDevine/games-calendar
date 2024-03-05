import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { Calendar, Whisper, Popover, Button, ButtonGroup, Panel, Checkbox } from 'rsuite';
import GameDetails from './GameDetails'; // Import the GameDetails component

const apiKey = 'c9bf349e90a04c5f852186b91ab54688';
const apiUrl = 'https://api.rawg.io/api/';

const platformIds = {
  playstation: 18,
  xbox: 1,
  pc: 4,
  switch: 7,
  mobile: 21
};

const App = () => {
  const [popularGames, setPopularGames] = useState([]);
  const [visibleMonth, setVisibleMonth] = useState(new Date());
  const [view, setView] = useState('calendar'); // 'calendar' or 'list'
  const [platformFilters, setPlatformFilters] = useState(Object.keys(platformIds).reduce((acc, platform) => ({ ...acc, [platform]: true }), {}));
  const [filterApplied, setFilterApplied] = useState(false);
  const [matureFilter, setMatureFilter] = useState(true);


  useEffect(() => {
    fetchPopularGames();
  }, [visibleMonth, view]);

  async function fetchPopularGames() {
    const startDate = new Date(visibleMonth);
    startDate.setDate(1);
    const endDate = new Date(visibleMonth);
    endDate.setMonth(endDate.getMonth() + 1, 0);

    const response = await fetch(`${apiUrl}games?key=${apiKey}&dates=${startDate.toISOString().split('T')[0]},${endDate.toISOString().split('T')[0]}&page_size=40`);

    if (!response.ok) {
      console.error('Network response was not ok');
      return;
    }

    const data = await response.json();
    setPopularGames(data.results);
  }

  function handleCalendarChange(date) {
    setVisibleMonth(date);
  }

  function toggleView() {
    setView(view === 'calendar' ? 'list' : 'calendar');
  }

  function togglePlatformFilter(platform) {
    setPlatformFilters(prevFilters => ({
      ...prevFilters,
      [platform]: !prevFilters[platform]
    }));
  }

  function toggleMatureFilter() {
    setMatureFilter(prevFilter => !prevFilter);
  }
  

  function applyFilters() {
  const filteredGames = popularGames.filter(game => {
    const platformIds = game.platforms.map(platform => platform.platform.id);
    const hasValidPlatform = platformIds.some(id => {
      if (platformFilters.playstation && (id === 18 || id === 187)) return true;
      if (platformFilters.xbox && (id === 1 || id === 186)) return true;
      if (platformFilters.pc && id === 4) return true;
      if (platformFilters.switch && id === 7) return true;
      if (platformFilters.mobile && (id === 21 || id === 3)) return true;
      return false;
    });

    const hasNoMatureTags = !game.tags || !game.tags.some(tag => 
      ['sexual content', 'nsfw', 'mature', 'hentai'].includes(tag.name.toLowerCase())
    );

    return hasValidPlatform && hasNoMatureTags;
  });

  setPopularGames(filteredGames);
  setFilterApplied(true);
}

  
  

  function clearFilters() {
    setPlatformFilters({
      playstation: true,
      xbox: true,
      pc: true,
      switch: true,
      mobile: true
    });
    fetchPopularGames(); // Fetch popular games again without any filtering
    setFilterApplied(false);
  }
  

  function renderPlatformCheckboxes() {
    return (
      <div>
        {Object.entries(platformFilters).map(([platform, checked]) => (
          <Checkbox key={platform} checked={checked} onChange={() => togglePlatformFilter(platform)}>
            {platform}
          </Checkbox>
        ))}
        
      </div>
    );
  }

  function renderMatureFilterToggle() {
    return (
      <Checkbox checked={matureFilter} onChange={toggleMatureFilter}>
        Show Mature Content
      </Checkbox>
    );
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
                    <Link to={`/game/${popularGames.find(game => game.name === title).id}`} style={{ color: 'inherit' }}>{title}</Link>
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
                <Link to={`/game/${popularGames.find(game => game.name === title).id}`} style={{ color: 'inherit' }}>{title}</Link>
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
                <Link to={`/game/${popularGames.find(game => game.name === title).id}`} style={{ color: 'inherit' }}>{title}</Link>
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
        <ButtonGroup size="md" style={{ margin: 10 }}>
          <Button className='listViewButton' onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1))}>&lt;</Button>
          <Button className='listViewButton'>{visibleMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</Button>
          <Button className='listViewButton' onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1))}>&gt;</Button>
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
          <Link to={`/game/${game.id}`} style={{ textDecoration: 'none' }}>
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
              {renderPlatformCheckboxes()}
              {renderMatureFilterToggle()}
              <Button className='filterButton' onClick={applyFilters}>Apply Filters</Button>
              {filterApplied && <Button className='filterButton' onClick={clearFilters}>Clear Filters</Button>}
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
              {renderPlatformCheckboxes()}
              {renderMatureFilterToggle()}
              <Button className='filterButton' onClick={applyFilters}>Apply Filters</Button>
              {filterApplied && <Button className='filterButton' onClick={clearFilters}>Clear Filters</Button>}
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
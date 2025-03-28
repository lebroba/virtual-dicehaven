import React, { useState, useEffect } from 'react';

type MapType = 'openSea' | 'coastal' | 'archipelago' | 'harbor';

interface CustomSettings {
  playerNation: string;
  enemyNation: string;
  playerFleetSize: number;
  enemyFleetSize: number;
  mapType: MapType;
}

import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { useGameEngine } from '../hooks/useGameEngine';
import ShipControl from './ShipControl';
import { ShipEntity, AmmoType } from '../types/Game';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

export const GameBoard: React.FC = () => {
  const {
    gameState,
    startGame,
    stopGame,
    setCourseAndSpeed,
    setSailConfiguration,
    fireCannons,
    repairShip,
    setupHistoricalBattle,
    setupCustomBattle,
  } = useGameEngine();
  
  const [selectedShipId, setSelectedShipId] = useState<string | null>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [battleType, setBattleType] = useState('historical');
  const [historicalBattle, setHistoricalBattle] = useState('trafalgar');
  const [customSettings, setCustomSettings] = useState<CustomSettings>({
    playerNation: 'british',
    enemyNation: 'french',
    playerFleetSize: 5,
    enemyFleetSize: 5,
    mapType: 'openSea'
  });
  
  // Start a new game
  const handleStartGame = () => {
    if (battleType === 'historical') {
      setupHistoricalBattle(historicalBattle);
    } else {
      setupCustomBattle(
        customSettings.playerNation,
        customSettings.enemyNation,
        customSettings.playerFleetSize,
        customSettings.enemyFleetSize,
        customSettings.mapType
      );
    }
    
    startGame();
    setGameStarted(true);
  };
  
  // End the current game
  const handleEndGame = () => {
    stopGame();
    setGameStarted(false);
    setSelectedShipId(null);
  };
  
  // Get currently selected ship
  const getSelectedShip = (): ShipEntity | null => {
    if (!selectedShipId) return null;
    
    const ship = gameState.entities.find(
      entity => entity.id === selectedShipId && entity.type === 'ship'
    );
    
    return ship as ShipEntity || null;
  };
  
  // Ship ammunition changes - in a real game, this would update the ship's cannons
  const handleAmmoChange = (side: 'port' | 'starboard' | 'bow' | 'stern', ammo: AmmoType) => {
    if (!selectedShipId) return;
    
    // This would update the ammunition type in an actual implementation
    // For now, we'll just console.log the change
    console.log(`Changed ${side} guns to ${ammo} ammunition`);
  };
  
  // Find player ships (ships that belong to player-controlled teams)
  const getPlayerShips = (): ShipEntity[] => {
    const playerTeamIds = gameState.teams
      .filter(team => team.isPlayerControlled)
      .map(team => team.id);
    
    return gameState.entities
      .filter(entity => 
        entity.type === 'ship' && 
        playerTeamIds.includes(entity.teamId)
      ) as ShipEntity[];
  };
  
  // Find enemy ships
  const getEnemyShips = (): ShipEntity[] => {
    const enemyTeamIds = gameState.teams
      .filter(team => !team.isPlayerControlled)
      .map(team => team.id);
    
    return gameState.entities
      .filter(entity => 
        entity.type === 'ship' && 
        enemyTeamIds.includes(entity.teamId)
      ) as ShipEntity[];
  };
  
  // Calculate wind arrow rotation for minimap display
  const getWindArrowStyle = () => {
    return {
      transform: `rotate(${gameState.windDirection}deg)`
    };
  };
  
  // Determine ship color based on team
  const getShipColor = (ship: ShipEntity) => {
    const team = gameState.teams.find(t => t.id === ship.teamId);
    return team ? team.color : '#888888';
  };
  
  // Determine if a ship is selected
  const isShipSelected = (ship: ShipEntity) => {
    return ship.id === selectedShipId;
  };
  
  // Get a summary of the game state (ships remaining, etc.)
  const getGameSummary = () => {
    const playerShips = getPlayerShips();
    const enemyShips = getEnemyShips();
    
    return {
      playerShipsCount: playerShips.length,
      enemyShipsCount: enemyShips.length,
      sinkingShips: gameState.entities.filter(e => e.type === 'ship' && e.status === 'sinking').length
    };
  };
  
  return (
    <div className="container mx-auto p-4">
      {!gameStarted ? (
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Age of Sail: Naval Command
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs defaultValue="historical" onValueChange={(value) => setBattleType(value)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="historical">Historical Battles</TabsTrigger>
                <TabsTrigger value="custom">Custom Battle</TabsTrigger>
              </TabsList>
              
              <TabsContent value="historical" className="space-y-4 p-4">
                <h3 className="text-lg font-semibold">Select a Historical Battle</h3>
                <Select value={historicalBattle} onValueChange={setHistoricalBattle}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a battle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trafalgar">Battle of Trafalgar (1805)</SelectItem>
                    <SelectItem value="nile">Battle of the Nile (1798)</SelectItem>
                    <SelectItem value="chesapeake">Battle of the Chesapeake (1781)</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-md mt-4">
                  {historicalBattle === 'trafalgar' && (
                    <div>
                      <h4 className="font-bold">Battle of Trafalgar</h4>
                      <p className="text-sm mt-1">
                        October 21, 1805 - A decisive naval battle where the British Royal Navy, 
                        led by Admiral Lord Nelson aboard HMS Victory, defeated the combined 
                        French and Spanish fleets.
                      </p>
                    </div>
                  )}
                  
                  {historicalBattle === 'nile' && (
                    <div>
                      <h4 className="font-bold">Battle of the Nile</h4>
                      <p className="text-sm mt-1">
                        August 1, 1798 - A major naval battle fought between the British Royal Navy 
                        led by Rear-Admiral Sir Horatio Nelson and the French Navy under Vice-Admiral 
                        François-Paul Brueys d'Aigalliers.
                      </p>
                    </div>
                  )}
                  
                  {historicalBattle === 'chesapeake' && (
                    <div>
                      <h4 className="font-bold">Battle of the Chesapeake</h4>
                      <p className="text-sm mt-1">
                        September 5, 1781 - A crucial naval battle in the American Revolutionary War 
                        where the French fleet under Comte de Grasse defeated the British fleet and 
                        prevented relief of British forces at Yorktown.
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="custom" className="space-y-4 p-4">
                <h3 className="text-lg font-semibold">Custom Battle Settings</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Nation</label>
                    <Select 
                      value={customSettings.playerNation} 
                      onValueChange={(value) => setCustomSettings({...customSettings, playerNation: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your nation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="british">Royal Navy (British)</SelectItem>
                        <SelectItem value="french">French Navy</SelectItem>
                        <SelectItem value="spanish">Spanish Navy</SelectItem>
                        <SelectItem value="american">US Navy</SelectItem>
                        <SelectItem value="dutch">Dutch Navy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Enemy Nation</label>
                    <Select 
                      value={customSettings.enemyNation} 
                      onValueChange={(value) => setCustomSettings({...customSettings, enemyNation: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select enemy nation" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="british">Royal Navy (British)</SelectItem>
                        <SelectItem value="french">French Navy</SelectItem>
                        <SelectItem value="spanish">Spanish Navy</SelectItem>
                        <SelectItem value="american">US Navy</SelectItem>
                        <SelectItem value="dutch">Dutch Navy</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Fleet Size</label>
                    <Select 
                      value={customSettings.playerFleetSize.toString()} 
                      onValueChange={(value) => setCustomSettings({...customSettings, playerFleetSize: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fleet size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Small Fleet (3 ships)</SelectItem>
                        <SelectItem value="5">Medium Fleet (5 ships)</SelectItem>
                        <SelectItem value="8">Large Fleet (8 ships)</SelectItem>
                        <SelectItem value="12">Grand Fleet (12 ships)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Enemy Fleet Size</label>
                    <Select 
                      value={customSettings.enemyFleetSize.toString()} 
                      onValueChange={(value) => setCustomSettings({...customSettings, enemyFleetSize: parseInt(value)})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select enemy fleet size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="3">Small Fleet (3 ships)</SelectItem>
                        <SelectItem value="5">Medium Fleet (5 ships)</SelectItem>
                        <SelectItem value="8">Large Fleet (8 ships)</SelectItem>
                        <SelectItem value="12">Grand Fleet (12 ships)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Map Type</label>
                    <Select 
                      value={customSettings.mapType} 
                      onValueChange={(value: 'openSea' | 'coastal' | 'archipelago' | 'harbor') => 
                        setCustomSettings({...customSettings, mapType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select map type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openSea">Open Sea - No obstacles</SelectItem>
                        <SelectItem value="coastal">Coastal - Land mass on one side</SelectItem>
                        <SelectItem value="archipelago">Archipelago - Islands to navigate</SelectItem>
                        <SelectItem value="harbor">Harbor - Enclosed area with narrow exit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-center pt-4">
              <Button 
                size="lg"
                className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleStartGame}
              >
                Set Sail!
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Game Controls */}
          <div className="lg:col-span-3 flex justify-between items-center bg-slate-100 dark:bg-slate-800 p-4 rounded-md">
            <div className="flex items-center gap-2">
              <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-md flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" 
                  viewBox="0 0 20 20" fill="currentColor"
                  style={getWindArrowStyle()}
                >
                  <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v4a1 1 0 002 0V4a1 1 0 00-1-1zm0 10a1 1 0 100 2 1 1 0 000-2z" clipRule="evenodd" />
                  <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 110-12 6 6 0 010 12z" />
                </svg>
                <span>Wind: {gameState.windDirection}° at {gameState.windSpeed} knots</span>
              </div>
              
              <div className="bg-slate-200 dark:bg-slate-700 p-2 rounded-md">
                <span>Weather: {gameState.weather}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-md">
                <span>Player Ships: {getGameSummary().playerShipsCount}</span>
              </div>
              
              <div className="bg-red-100 dark:bg-red-900 p-2 rounded-md">
                <span>Enemy Ships: {getGameSummary().enemyShipsCount}</span>
              </div>
              
              <Button variant="destructive" onClick={handleEndGame}>
                End Battle
              </Button>
            </div>
          </div>
          
          {/* Map Area */}
          <div className="lg:col-span-2 bg-blue-100 dark:bg-blue-900 rounded-md h-[500px] relative">
            {/* This would be replaced with an actual map rendering component */}
            <div className="absolute inset-0 bg-blue-200 dark:bg-blue-800 opacity-50">
              {/* Minimap grid */}
              <div className="grid grid-cols-10 grid-rows-10 h-full w-full">
                {Array.from({ length: 100 }).map((_, i) => (
                  <div key={i} className="border border-blue-300 dark:border-blue-700 opacity-30" />
                ))}
              </div>
            </div>
            
            {/* Ship icons on the minimap */}
            {gameState.entities
              .filter(entity => entity.type === 'ship')
              .map(entity => {
                const ship = entity as ShipEntity;
                const shipSize = ship.shipClass.includes('First') || ship.shipClass.includes('Second') ? 16 :
                                ship.shipClass.includes('Third') || ship.shipClass.includes('Fourth') ? 12 : 8;
                
                return (
                  <div
                    key={ship.id}
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
                      isShipSelected(ship) ? 'ring-2 ring-white' : ''
                    }`}
                    style={{
                      left: `${(ship.position.x / 100) * 100}%`,
                      top: `${(ship.position.y / 100) * 100}%`,
                      width: `${shipSize}px`,
                      height: `${shipSize * 2}px`,
                      backgroundColor: getShipColor(ship),
                      transform: `translate(-50%, -50%) rotate(${ship.rotation}deg)`,
                      borderRadius: '2px',
                      cursor: 'pointer'
                    }}
                    onClick={() => setSelectedShipId(ship.id)}
                  />
                );
              })}
          </div>
          
          {/* Ship Controls & Fleet List */}
          <div className="space-y-4">
            {/* Selected Ship Controls */}
            {selectedShipId ? (
              <div>
                {getSelectedShip() && (
                  <ShipControl
                    ship={getSelectedShip()!}
                    windDirection={gameState.windDirection}
                    windSpeed={gameState.windSpeed}
                    weather={gameState.weather}
                    onCourseChange={(course) => setCourseAndSpeed(selectedShipId, course, getSelectedShip()!.currentSpeed)}
                    onSpeedChange={(speed) => setCourseAndSpeed(selectedShipId, getSelectedShip()!.rotation, speed)}
                    onSailConfigChange={(config) => setSailConfiguration(selectedShipId, config)}
                    onFireCannons={(side) => fireCannons(selectedShipId, side)}
                    onRepair={(type) => repairShip(selectedShipId, type)}
                    onAmmoChange={handleAmmoChange}
                  />
                )}
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Ship Selection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p>Select a ship on the map to view controls</p>
                </CardContent>
              </Card>
            )}
            
            {/* Fleet List */}
            <Card>
              <CardHeader>
                <CardTitle>Your Fleet</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ul className="divide-y divide-slate-200 dark:divide-slate-700">
                  {getPlayerShips().map(ship => (
                    <li 
                      key={ship.id}
                      className={`p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 ${
                        isShipSelected(ship) ? 'bg-slate-200 dark:bg-slate-700' : ''
                      }`}
                      onClick={() => setSelectedShipId(ship.id)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{ship.name}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {ship.shipClass} • Health: {Math.round(ship.damageState.hullIntegrity)}%
                          </p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${
                          ship.status === 'idle' ? 'bg-green-500' :
                          ship.status === 'moving' ? 'bg-blue-500' :
                          ship.status === 'combat' ? 'bg-red-500' :
                          ship.status === 'sinking' ? 'bg-red-900' :
                          'bg-yellow-500'
                        }`} />
                      </div>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

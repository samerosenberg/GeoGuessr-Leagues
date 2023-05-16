import React, { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import secrets from "./secrets.json";

function App() {
    /**
     * Of the form [leg: [games: [rounds]]]
     *
     * @type {*} */
    const [scoreData, setScoreData] = useState<[IGameWrapper[]]>();
    const [players, setPlayers] = useState<IPlayerData>();
    const [totalScoreTable, setTotalScoreTable] = useState<{ [key: string]: number }>();
    const [totalTimeTable, setTotalTimeTable] = useState<{ [key: string]: number }>();

    const leagueId = secrets.leagueId;

    useEffect(() => {
        if (!scoreData) {
            axios.get(`/league/${leagueId}`).then((res: any) => {
                setScoreData(res.data);
            });
        }

        if (!players) {
            axios.get(`/players/${leagueId}`).then((res) => {
                setPlayers(res.data);
            });
        }
    }, []);

    useEffect(() => {
        if (scoreData && players) {
            setTotalScoreTable(getTotalLeagueScore());
            setTotalTimeTable(getTotalTime());
        }
    }, [scoreData, players]);

    /**
     * Create array of players: total score for month
     *
     * @return {*}  {{ [key: string]: number }}
     */
    function getTotalLeagueScore(): { [key: string]: number } {
        if (!scoreData) {
            return {};
        }
        var totalScoreTable: { [key: string]: number } = {};
        for (const leg of scoreData) {
            for (const game of leg) {
                if (!Object.keys(totalScoreTable).includes(game.userId)) {
                    totalScoreTable[game.userId] = game.totalScore;
                } else {
                    totalScoreTable[game.userId] += game.totalScore;
                }
            }
        }
        return totalScoreTable;
    }

    function getTotalTime(): { [key: string]: number } {
        if (!scoreData) {
            return {};
        }
        var totalTimeTable: { [key: string]: number } = {};
        for (const leg of scoreData) {
            for (const game of leg) {
                for (const guess of game.game.player.guesses) {
                    if (!Object.keys(totalTimeTable).includes(game.userId)) {
                        totalTimeTable[game.userId] = guess.time;
                    } else {
                        totalTimeTable[game.userId] += guess.time;
                    }
                }
            }
        }
        return totalTimeTable;
    }

    if (scoreData && totalScoreTable && players && totalTimeTable) {
        return (
            <div className="App">
                <header className="App-header"></header>
                <h3>Leg 1 scores</h3>
                <table className="results-table">
                    <thead className="headers">
                        <tr className="header-row">
                            <th className="header-col">Player</th>
                            <th className="header-col">Round 1</th>
                            <th className="header-col">Round 2</th>
                            <th className="header-col">Round 3</th>
                            <th className="header-col">Round 4</th>
                            <th className="header-col">Round 5</th>
                            <th className="header-col">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {scoreData[0].map((game, index) => {
                            return (
                                <tr key={index}>
                                    <td>{game.playerName}</td>
                                    <td>{game.game.player.guesses[0].roundScoreInPoints}</td>
                                    <td>{game.game.player.guesses[1].roundScoreInPoints}</td>
                                    <td>{game.game.player.guesses[2].roundScoreInPoints}</td>
                                    <td>{game.game.player.guesses[3].roundScoreInPoints}</td>
                                    <td>{game.game.player.guesses[4].roundScoreInPoints}</td>
                                    <td>{game.totalScore}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <h3>Total Scores</h3>
                <table className="total-score-table">
                    <thead className="headers">
                        <tr className="header-row">
                            <th className="header-col">Player</th>
                            <th className="header-col">Total Score</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(totalScoreTable).map((userId, index) => {
                            return (
                                <tr key={index}>
                                    <td>{players[userId].user.nick}</td>
                                    <td>{totalScoreTable[userId]}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                <h3>Total time</h3>
                <table className="total-time-table">
                    <thead className="headers">
                        <tr className="header-row">
                            <th className="header-col">Player</th>
                            <th className="header-col">Total Time</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(totalTimeTable).map((userId, index) => {
                            return (
                                <tr key={index}>
                                    <td>{players[userId].user.nick}</td>
                                    <td>{totalTimeTable[userId]}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        );
    } else {
        return <div></div>;
    }
}

interface IPlayerData {
    [id: string]: IPlayerProfile;
}

interface IGameWrapper {
    game: IGame;
    gameToken: string;
    isLeader: boolean;
    pinUrl: string;
    playerName: string;
    totalScore: number;
    userId: string;
}

interface IGame {
    forbidMoving: boolean;
    forbidRotating: boolean;
    forbidZooming: boolean;
    map: string;
    mapName: string;
    mode: string;
    player: IGamePlayer;
    progressChange: IProgressChange;
    quickPlayProgress?: string;
    round: number;
    roundCount: number;
    rounds: IRound[];
    state: string;
    streakType: string;
    timeLimit: string;
    token: string;
    type: string;
}

interface IGamePlayer {
    currentPosition: number;
    explorer?: string;
    guesses: IGuess[];
    id: string;
    isLeader: boolean;
    isVerified: boolean;
    newBadges: [];
    nick: string;
    totalDistance: IDistance;
    totalDistanceInMeters: number;
    totalScore: IScore;
    totalStreak: number;
    totalTime: number;
}

interface IProgressChange {
    awardedXp: { totalAwardedXp: number };
    competitiveProgress?: string;
    medal: number;
    newRank?: [];
    prevRank?: [];
    seasonProgress?: string;
}

interface IRound {
    heading: number;
    lat: number;
    lng: number;
    panoId: string;
    pitch: number;
    streakLocationCode: string;
    zoom: string;
}

interface IGuess {
    distance: IDistance;
    distanceInMeters: number;
    lat: number;
    lng: number;
    roundScore: IScore;
    roundScoreInPercentage: number;
    roundScoreInPoints: number;
    skippedRound: boolean;
    streakLocationCode?: string;
    time: number;
    timedOut: boolean;
    timedOutWithGuess: boolean;
}

interface IDistance {
    meters: { amount: string; unit: string };
    miles: { amount: string; unit: string };
}

interface IScore {
    amount: string;
    percentage: number;
    units: string;
}

interface IPlayerProfile {
    isWinner: boolean;
    totalPoints: number;
    totalScore: number;
    user: IUser;
}

interface IUser {
    avatar: { fullBodyPath?: string };
    br: { level: number; division: number; streak: number };
    color: number;
    competitive: {};
    consumedTrial: boolean;
    countryCode: string;
    created: string;
    dailyChallengeProgress: number;
    explorerProgress?: number;
    fullBodyPin?: string;
    id: string;
    isBanned: boolean;
    isBotUser: boolean;
    isProUser: boolean;
    isVerified: boolean;
    lastNameChange: string;
    nameChangeAvailableAt?: string;
    nick: string;
    onboarding: { tutorialToken?: string; tutorialState: string };
    progress: { level: number };
    streakProgress?: string;
    suspendedUntil?: string;
    url: string;
}

export default App;

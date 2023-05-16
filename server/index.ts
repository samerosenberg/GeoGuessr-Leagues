import express from "express";
import axios from "axios";
import cookie from "../secrets.json";

const PORT = process.env.PORT || 3001;

const app = express();

const headers = {
    headers: {
        Cookie: cookie.Cookie,
        Accept: "application/json",
    },
};

app.get("/league/:leagueId", (req, res) => {
    var responseData: string[] = [];
    axios.get(`https://www.geoguessr.com/api/v3/leagues/${req.params.leagueId}`, headers).then(async (response) => {
        //For each finished leg, retrieve it's stats and add to the responseData
        for (const leg of response.data["league"]["finishedLegs"]) {
            const legId = leg["challengeId"];
            const legStats = await getLegStats(legId);
            responseData.push(legStats["items"]);
        }

        //Then append current leg
        //? Can current leg not exist? Can finished legs not exist?
        const currentLegId = response.data["league"]["currentLeg"]["challengeId"];
        const currentLegStats = await getLegStats(currentLegId);
        responseData.push(currentLegStats["items"]);

        // Send json response back to client
        res.json(responseData);
    });
});

app.get("/players/:leagueId", (req, res) => {
    var responseData: { [index: string]: string } = {};
    axios.get(`https://www.geoguessr.com/api/v3/leagues/${req.params.leagueId}/scores/0?limit=26`, headers).then((response) => {
        for (const player of response.data["scores"]) {
            responseData[player["user"]["id"]] = player;
        }
        res.json(responseData);
    });
});

/**
 * Retrieve stats from
 *
 * @param {string} gameId
 * @return {*}  {Promise<any>}
 */
function getLegStats(legId: string): Promise<any> {
    return axios.get(`https://www.geoguessr.com/api/v3/results/highscores/${legId}?friends=false&limit=26`, headers).then((response) => {
        return response.data;
    });
}

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

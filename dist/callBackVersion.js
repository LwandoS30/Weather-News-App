"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https")); //https for HTTPS request fro the API
const fs_1 = __importDefault(require("fs")); // read/wirte files locally 
const apiInterfaces_1 = require("./Interfaces/apiInterfaces");
function fetchData(url, callback) {
    https_1.default.get(url, (res) => {
        let data = "";
        //receiving and assing chunks of data to prev declared data variable
        res.on("data", (chunk) => {
            data += chunk;
        });
        res.on("end", () => {
            if (!data || data.length === 0) {
                callback(new Error("No data received from the API"), null);
                return;
            }
            const parseData = JSON.parse(data || "{}");
            if (!parseData || typeof parseData !== "object") {
                callback(new Error("Invalid JSON structure received"), null);
                return;
            }
            callback(null, parseData);
        });
    })
        .on("error", (err) => {
        if (err) {
            callback(err, null);
        }
    });
}
console.log("Starting data fetching...");
fetchData("https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&currentData=true", (weatherErr, weatherData) => {
    if (weatherErr) {
        console.error("Weather Error", weatherErr.message);
        return;
    }
    if (!apiInterfaces_1.WeatherData || !apiInterfaces_1.WeatherData.currentWeather) {
        console.error("Weather Error: Missing current weather data");
    }
    console.log("Weather fetched successfully!");
    console.log("Current weather: ", apiInterfaces_1.WeatherData.currentWeather);
    fetchData("https://dummyjson.com/posts", (newsErr, NewsData) => {
        if (newsErr) {
            console.error("News Error: ", newsErr.message);
            return;
        }
        if (!NewsData || !Array.isArray(NewsData.posts)) {
            console.error("News Error: Invalid news data structure");
            return;
        }
        const topHeadlines = NewsData.posts.slice(0, 3).map((post) => post.title);
        console.log("\nTop three News Headlines: ");
        topHeadlines.forEach((headline, index) => {
            console.log(`${index + 1}. ${headline}`);
        });
        const results = {
            weather: apiInterfaces_1.WeatherData.currentWeather,
            news: topHeadlines
        };
        fs_1.default.writeFile("result.json", JSON.stringify(results, null, 2), (writeErr) => {
            if (writeErr) {
                console.log("File write Error: ", writeErr.message);
                return;
            }
            console.log("\nAll data successfully saves to result.json!");
        });
    });
});

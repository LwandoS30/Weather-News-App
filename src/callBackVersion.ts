import https from "https"; //https for HTTPS request fro the API
import fs from "fs"; // read/wirte files locally 
import { WeatherData, NewsData, Post, Results } from './Interfaces/apiInterfaces';

function fetchData<T>(url: string, callback: (error: Error | null, data: T | null) => void ):void {
    https.get(url, (res) => {
        let data = "";

        //receiving and assing chunks of data to prev declared data variable
        res.on("data", (chunk) => {
            data += chunk;
        });

        res.on("end", () => {
            if(!data || data.length === 0){
                callback(new Error("No data received from the API"), null);
                return;
            }
            const parseData = JSON.parse(data || "{}");

            if(!parseData || typeof parseData !== "object"){
                callback(new Error("Invalid JSON structure received"), null);
                return;
            }
            callback(null, parseData as T);
        });

    })
    .on("error", (err) => {
        if(err){
            callback(err, null);
        }
    });
}

console.log("Starting data fetching...");

fetchData<WeatherData>("https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&currentData=true",
    (weatherErr, weatherData) =>{
        if(weatherErr){
            console.error("Weather Error", weatherErr.message);
            return;
        }
        if(!weatherData || !weatherData.currentWeather){
                console.error("Weather Error: Missing current weather data");
        }
        console.log("Weather fetched successfully!");
        console.log("Current weather: ", weatherData.currentWeather);

        fetchData<NewsData>("https://dummyjson.com/posts", (newsErr, NewsData) => {
            if(newsErr){
                console.error("News Error: ", newsErr.message);
                return;
            }

            if(!NewsData || !Array.isArray(NewsData.posts)){
                console.error("News Error: Invalid news data structure");
                return;
            }

            const topHeadlines = NewsData.posts.slice(0, 3).map((post: { title: any; }) => post.title);
            console.log("\nTop three News Headlines: ");
            topHeadlines.forEach((headline: any, index: number) => {
                console.log(`${index + 1}. ${headline}`);
            });

            const results: Results = {
                weather: weatherData.currentWeather,
                newsData: topHeadlines
            }

            fs.writeFile("result.json", JSON.stringify(results, null, 2), (writeErr) => {
                if(writeErr){
                    console.log("File write Error: ", writeErr.message);
                    return;
                }
                console.log("\nAll data successfully saves to result.json!");
                
            });
        });
    }
  
);
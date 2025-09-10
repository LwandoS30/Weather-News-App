import https from "https";
import fs from "fs";
import { WeatherData, NewsData, Post, Results } from './Interfaces/apiInterfaces';

function fetchData<T>(url: string): Promise<T>{
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            let data = "";

            res.on("data", (chunk) => {
                data += chunk;
            });

            res.on("end", () => {
                if(!data || data.length === 0){
                    reject(new Error("No data received from API")); 
                    return;
                }

                const  parseData = JSON.parse(data || "{}");

                if(!parseData || typeof parseData !== "object"){
                    reject(new Error("Invalid JSON structure received"));
                    return;
                }

                resolve(parseData as T);
            });
        }).on("error", (err) => {
            reject(err);
        });
    });
}

function saveToFile(filePath: string, data: unknown): Promise<void>{
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), (err) => {
            if(err){
                reject(err);
                return;
            }
            resolve();
        });
    });
}

console.log("Starting data fetch sequence...");

fetchData<WeatherData>(
    "https://api.open-meteo.com/v1/forecast?latitude=-33.9249&longitude=18.4241&currentWeather=true"
)
.then((weatherData) => {
    if(!weatherData || !weatherData.currentData){
        throw new Error("Weather Error: Missing weather data");
    }

    console.log("Weather fetch successfully");
    console.log("Current Weather: ", weatherData.currentData);
    
    return Promise.all([weatherData, fetchData<NewsData>("https://dummyjson.com/posts")]);
})
.then(([weatherData, newsData]) => {
    if(newsData || !Array.isArray(newsData.posts)){
        throw new Error("News Error: Invalid or missing posts array");
    }

    const topHeadlines = newsData.posts.slice(0, 3).map((post: { title: any; }) => post.title);

    console.log("\nTop three News Headlines:");
    topHeadlines.forEach((headline: any, index: number) => {
        console.log(`${index + 1}. ${headline}`);
    });

    return saveToFile("result.json", results);
}).then(() => {
    console.log("\All rdata successfully saved to result.json!");
}).catch((err) => {
    console.error("An error occured: ", err.message);
});
export interface WeatherData{
    currentData:{
        temperature: number;
        windSpeed: number;
        weatherCode: number;
        time: string;
    };
}

export interface NewsData{
    posts: Post[];
}

export interface Post{
    id: number;
    title: string;
    body: string;
    userId: number;
}

export interface Results{
    weather: WeatherData["currentData"];
    news: string;
}
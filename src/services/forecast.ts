import { StormGlass, IForecastPoint } from '@src/clients/stormGlass';
import { InternalError } from '@src/util/errors/internal-error';
import { Beach, IBeach } from '@src/models/beach';

export interface IBeachForecast extends Omit<IBeach, 'user'>, IForecastPoint {}

export interface ITimeForecast {
    time: string;
    forecast: IBeachForecast[];
}

export class ForecastProcessingInternalError extends InternalError {
    constructor(message: string) {
        super(`Unexpectd error during the forecast processing: ${message}`);
    }
}

export interface IBeachForecast extends Omit<IBeach, 'user'>, IForecastPoint {}

export class Forecast {
    constructor(protected stormGlass = new StormGlass()) {}

    public async processForecastForBeaches(
        beaches: IBeach[]
    ): Promise<ITimeForecast[]> {
        const pointsWithCorrectSources: IBeachForecast[] = [];
        try {
            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoints(
                    beach.lat,
                    beach.lon
                );
                const enrichedBeachData = this.enrichedBeachData(points, beach);
                pointsWithCorrectSources.push(...enrichedBeachData);
            }
            return this.mapForecastByTime(pointsWithCorrectSources);
        } catch (error) {
            throw new ForecastProcessingInternalError((error as Error).message);
        }
    }

    private enrichedBeachData(
        points: IForecastPoint[],
        beach: IBeach
    ): IBeachForecast[] {
        return points.map((e) => ({
            ...{},
            ...{
                lat: beach.lat,
                lon: beach.lon,
                name: beach.name,
                position: beach.position,
                rating: 1,
            },
            ...e,
        }));
    }

    private mapForecastByTime(forecast: IBeachForecast[]): ITimeForecast[] {
        const forecastByTime: ITimeForecast[] = [];
        for (const point of forecast) {
            const timePoint = forecastByTime.find((f) => f.time === point.time);
            if (timePoint) {
                timePoint.forecast.push(point);
            } else {
                forecastByTime.push({
                    time: point.time,
                    forecast: [point],
                });
            }
        }
        return forecastByTime;
    }
}

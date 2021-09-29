import { StormGlass, IForecastPoint } from '../clients/stormGlass';
import { InternalError } from '../util/errors/internal-error';
import { IBeach } from '../models/beach';
import logger from '../logger';

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
        logger.info(`Preparing the forecast for ${beaches.length} beaches`);
        try {
            for (const beach of beaches) {
                const points = await this.stormGlass.fetchPoints(
                    beach.lat,
                    beach.lng
                );
                const enrichedBeachData = this.enrichedBeachData(points, beach);
                pointsWithCorrectSources.push(...enrichedBeachData);
            }
            return this.mapForecastByTime(pointsWithCorrectSources);
        } catch (error) {
            logger.error(error as Error);
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
                lng: beach.lng,
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

import { InternalError } from '@src/util/errors/internal-error';
import { AxiosError, AxiosStatic } from 'axios';

export interface IStormGlassPointSource {
    [key: string]: number;
}

export interface IStormGlassPoint {
    readonly time: string;
    readonly waveHeight: IStormGlassPointSource;
    readonly waveDirection: IStormGlassPointSource;
    readonly swellDirection: IStormGlassPointSource;
    readonly swellHeight: IStormGlassPointSource;
    readonly swellPeriod: IStormGlassPointSource;
    readonly windDirection: IStormGlassPointSource;
    readonly windSpeed: IStormGlassPointSource;
}

export interface IStormGlassForecastResponse {
    hours: IStormGlassPoint[];
}

export interface IForecastPoint {
    time: string;
    waveHeight: number;
    waveDirection: number;
    swellDirection: number;
    swellHeight: number;
    swellPeriod: number;
    windDirection: number;
    windSpeed: number;
}

export class ClientRequestError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            'Unexpected error when trying to communicate to StormGlass';
        super(`${internalMessage}: ${message}`);
    }
}

export class StormGlassResponseError extends InternalError {
    constructor(message: string) {
        const internalMessage =
            'Unexpected error returned by the StormGlass service';
        super(`${internalMessage}: ${message}`);
    }
}

export class StormGlass {
    readonly stormGlassAPIParams =
        'swellDirection,swellHeight,swellPeriod,waveDirection,waveHeight,windDirection,windSpeed';
    readonly stormGlassAPISource = 'noaa';

    constructor(protected request: AxiosStatic) {}

    public async fetchPoints(
        lat: number,
        lon: number
    ): Promise<IForecastPoint[]> {
        try {
            const response =
                await this.request.get<IStormGlassForecastResponse>(
                    `https://api.stormglass.io/v2/weather/point?params=${this.stormGlassAPIParams}&source=${this.stormGlassAPISource}&end=1592113802&lat=${lat}&lng=${lon}`,
                    {
                        headers: {
                            Authorization: 'fake-token',
                        },
                    }
                );
            return this.normalizeResponse(response.data);
        } catch (err: unknown) {
            if (
                (err as AxiosError).response &&
                (err as AxiosError).response?.data
            ) {
                throw new StormGlassResponseError(
                    `Error: ${JSON.stringify(
                        (err as AxiosError).response?.data
                    )} Code: ${(err as AxiosError).response?.status}`
                );
            }

            throw new ClientRequestError((err as Error).message);
        }
    }

    private normalizeResponse(
        points: IStormGlassForecastResponse
    ): IForecastPoint[] {
        return points.hours
            .filter(this.isValidPoint.bind(this))
            .map((point) => ({
                swellDirection: point.swellDirection[this.stormGlassAPISource],
                swellHeight: point.swellHeight[this.stormGlassAPISource],
                swellPeriod: point.swellPeriod[this.stormGlassAPISource],
                time: point.time,
                waveDirection: point.waveDirection[this.stormGlassAPISource],
                waveHeight: point.waveHeight[this.stormGlassAPISource],
                windDirection: point.windDirection[this.stormGlassAPISource],
                windSpeed: point.windSpeed[this.stormGlassAPISource],
            }));
    }

    private isValidPoint(point: Partial<IStormGlassPoint>): boolean {
        return !!(
            point.time &&
            point.swellDirection?.[this.stormGlassAPISource] &&
            point.swellHeight?.[this.stormGlassAPISource] &&
            point.swellPeriod?.[this.stormGlassAPISource] &&
            point.waveDirection?.[this.stormGlassAPISource] &&
            point.waveHeight?.[this.stormGlassAPISource] &&
            point.windDirection?.[this.stormGlassAPISource] &&
            point.windSpeed?.[this.stormGlassAPISource]
        );
    }
}
